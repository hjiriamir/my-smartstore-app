import express from 'express';
import {
  createLocalEvent,
  getAllLocalEvents,
  getLocalEventById,
  updateLocalEvent,
  deleteLocalEvent,
  createLocalEventsList
} from '../Controller/localEventController.js';

const router = express.Router();

router.post('/createLocalEvent', createLocalEvent);
router.get('/getAllLocalEvents', getAllLocalEvents);
router.get('/getLocalEventById/:event_id', getLocalEventById);
router.put('/updateLocalEvent/:event_id', updateLocalEvent);
router.delete('/deleteLocalEvent/:event_id', deleteLocalEvent);
router.post('/createLocalEventsList/bulk', createLocalEventsList);

export default router;
