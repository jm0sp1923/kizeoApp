import express from "express";
const router = express.Router();
import { getHome, getFusionarExcel,getUpdateList} from '../../controllers/viewsController.js';

router.get('/', getHome);
router.get("/fusionarExcelViews", getFusionarExcel);
router.get("/updateListViews", getUpdateList);
export default router;
