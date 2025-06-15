import express from 'express';
import {
  getAllActions,
  getActionById,
  createAction,
  deleteAction,
} from '../Controller/historiqueActionController.js';

const router = express.Router();

router.get('/getAllActions', getAllActions);
router.get('/getActionById/:id', getActionById);
router.post('/createAction/', createAction);
router.delete('/deleteAction/:id', deleteAction);

export default router;
