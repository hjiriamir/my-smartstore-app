import express from 'express';
import {
    createHeatmapData,
    getAllHeatmapData,
    getHeatmapDataById,
    updateHeatmapData,
    deleteHeatmapData,
    createHeatmapDataList,
    getHeatmapStats,
    getStatsByZone
} from '../Controller/heatmapController.js';

const router = express.Router();

// CRUD routes pour HeatmapData
router.post('/createHeatmapData', createHeatmapData);
router.get('/getAllHeatmapData', getAllHeatmapData);
router.get('/getHeatmapDataById/:id', getHeatmapDataById);
router.put('/updateHeatmapData/:id', updateHeatmapData);
router.delete('/deleteHeatmapData/:id', deleteHeatmapData);
router.post('/createHeatmapDataList', createHeatmapDataList);
router.get('/stats', getHeatmapStats);
router.get('/stats/zone', getStatsByZone);

export default router;
