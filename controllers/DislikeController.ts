/**
 * @file Controller RESTful Web service API for dislikes resource
 */
import {Request, Response, Express} from "express";
import TuitDao from "../daos/TuitDao";
import DislikeDao from "../daos/DislikeDao";

/**
 * @class DislikeController Implements RESTful Web service API for d resource.
 * Defines the following HTTP endpoints:
 * <ul>
 *     <li>GET /api/users/:uid/likes to retrieve all the tuits liked by a user
 *     </li>
 *     <li>GET /api/tuits/:tid/likes to retrieve all users that liked a tuit
 *     </li>
 *     <li>POST /api/users/:uid/likes/:tid to record that a user likes a tuit
 *     </li>
 *     <li>DELETE /api/users/:uid/unlikes/:tid to record that a user
 *     no longer likes a tuit</li>
 *     <li> DELETE /api/likes to delete all like instances
 * </ul>
 * @property {LikeDao} likeDao Singleton DAO implementing like CRUD operations
 * @property {LikeController} likeController Singleton controller implementing
 * RESTful Web service API
 */
export default class DislikeController {

    private static dislikeDao: DislikeDao = DislikeDao.getInstance();
    private static tuitDao: TuitDao = TuitDao.getInstance();
    private static dislikeController: DislikeController | null = null;

    /**
     * Creates singleton controller instance
     * @param {Express} app Express instance to declare the RESTful Web service
     * API
     * @return DislikeController
     */
    public static getInstance = (app: Express): DislikeController => {

        if (DislikeController.dislikeController === null) {
            DislikeController.dislikeController = new DislikeController();
            app.get("/api/users/:uid/dislikes", DislikeController.dislikeController.findAllTuitsDislikedByUser)
            app.get("/api/tuits/:tid/dislikes", DislikeController.dislikeController.findAllUsersThatDislikedTuit);
            app.post("/api/users/:uid/dislikes/:tid", DislikeController.dislikeController.userDislikeTuit);
            app.delete("/api/users/:uid/cancelDislikes/:tid", DislikeController.dislikeController.userCancelUnlikeTuit);
            app.put("/api/users/:uid/dislikes/:tid",DislikeController.dislikeController.userTogglesTuitDislikes);
        }
        return DislikeController.dislikeController;

    }

    private constructor() {
    }

    /**
     * Retrieves all tuits liked by a user from the database
     * @param {Request} req Represents request from client, including the path
     * parameter uid representing the user liked the tuits
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the tuit objects that were liked
     */
    findAllTuitsDislikedByUser = (req: Request, res: Response) =>
        DislikeController.dislikeDao.findAllTuitsDislikedByUser(req.params.uid)
            .then(dislikes => res.json(dislikes));

    /**
     * Retrieves all users that liked a tuit from the database
     * @param {Request} req Represents request from client, including the path
     * parameter tid representing the liked tuit
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON arrays containing the user objects
     */
    findAllUsersThatDislikedTuit = (req: Request, res: Response) =>
        DislikeController.dislikeDao.findAllUsersThatDislikedTuit(req.params.tid)
            .then(dislikes => res.json(dislikes));

    /**
     * Create a new dislike with given user and tuit.
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is liking the tuit
     * and the tuit being liked
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new like that was inserted in the
     * database
     */
    userDislikeTuit = (req: Request, res: Response) =>
        DislikeController.dislikeDao.userDislikeTuit(req.params.tid, req.params.uid)
            .then(dislikes => res.json(dislikes));

    /**
     * Delete a like in database and returns status of delete.
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is unliking
     * the tuit and the tuit being unliked
     * @param {Response} res Represents response to client, including status
     * on whether deleting the like was successful or not
     */
    userCancelUnlikeTuit = (req: Request, res: Response) =>
        DislikeController.dislikeDao.userCancelUnlikeTuit(req.params.tid, req.params.uid)
            .then(status => res.send(status));


    /**
     * @param {Request} req Represents request from client, including the
     * path parameters uid and tid representing the user that is liking the tuit
     * and the tuit being liked
     * @param {Response} res Represents response to client, including the
     * body formatted as JSON containing the new likes that was inserted in the
     * database
     */
    userTogglesTuitDislikes = async (req:Request,res:Response)=>{
        const dislikeDao = DislikeController.dislikeDao;
        const tuitDao = DislikeController.tuitDao;
        const uid = req.params.uid;
        const tid = req.params.tid;

        // @ts-ignore
        const profile = req.session['profile'];
        const userId = uid === "me" && profile?
            profile._id:uid;

        try{
            const userAlreadydislikedTuit = await dislikeDao.findUserDislikesTuit(userId,tid);
            const howManydislikedTuit = await dislikeDao.countHowManydislikedTuit(tid);
            let tuit = await tuitDao.findTuitById(tid);
            if(userAlreadydislikedTuit){
                await dislikeDao.userCancelUnlikeTuit(userId,tid);
                tuit.stats.dislikes = howManydislikedTuit - 1;
            }else{
                await dislikeDao.userDislikeTuit(userId,tid);
                tuit.stats.likes = howManydislikedTuit + 1;
            };

            await tuitDao.updateLikes(tid,tuit.stats);
            res.sendStatus(200);
        }catch(e){
            res.sendStatus(404);
        }

    }

};


