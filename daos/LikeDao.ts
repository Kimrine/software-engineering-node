/**
 * @file Implements DAO managing data storage of likes. Uses mongoose LikeModel
 * to integrate with MongoDB
 */
import LikeDaoI from "../interfaces/likes/LikeDaoI";
import LikeModel from "../mongoose/likes/LikeModel";
import Like from "../models/likes/Like";

/**
 * @class LikeDao Implements Data Access Object managing data storage
 * of Likes
 * @property {LikeDao} likeDao private single instance of LikeDao
 */
export default class LikeDao implements LikeDaoI {
    private static likeDao: LikeDao | null = null;

    /**
     * Creates singleton DAO instance
     * @returns LikeDao
     */
    public static getInstance = (): LikeDao => {
        if (LikeDao.likeDao == null) {
            LikeDao.likeDao = new LikeDao();
        }
        return LikeDao.likeDao;
    }

    private constructor() {
    }

    /**
     * Uses LikeModel to retrieve all likes documents with specific tuit from likes collection
     * @returns Promise To be notified when the likes are retrieved from
     * database
     */
    findAllUsersThatLikedTuit = async (tid: string): Promise<Like[]> =>
        LikeModel.find({tuit: tid})
            .populate("likedBy")
            .exec();

    /**
     * Uses LikeModel to retrieve all likes documents with specific user from likes collection
     * @returns Promise To be notified when the likes are retrieved from
     * database
     */
    findAllTuitsLikedByUser = async (uid: string): Promise<Like[]> =>
        LikeModel.find({likedBy: uid})
            .populate("tuit")
            .exec();

    /**
     * Inserts like instance into the database
     * @param {string} tid Tuit's primary key
     * @param {string} uid User's primary key
     * @returns Promise To be notified when like is inserted into the database
     */
    userLikeTuit = async (tid: string, uid: string): Promise<any> =>
        LikeModel.create({tuit: tid, likedBy: uid});

    /**
     * Removes like from the database
     * @param {string} tid Tuit's primary key
     * @param {string} uid User's primary key
     * @returns Promise To be notified when like is removed from the database
     */
    userUnlikesTuit = async (tid: string, uid: string): Promise<any> =>
        LikeModel.deleteOne({tuit: tid, likedBy: uid});

    /**
     * Removes all likes from the database. Useful for testing
     * @returns Promise To be notified when all likes are removed from the
     * database
     */
    deleteAllLike = async (): Promise<any> =>
        LikeModel.deleteMany();


}




