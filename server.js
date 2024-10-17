const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const DRONE_CONFIG_URL = 'https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec';
const DRONE_LOGS_URL = 'https://app-tracking.pockethost.io/api/collections/drone_logs/records';

// GET /configs/:id
app.get('/configs/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const response = await axios.get(`${DRONE_CONFIG_URL}?drone_id=${id}`);
      let data = response.data.data; // เข้าถึงส่วน data ที่เป็น array

      // หาโดรนที่มี drone_id ตรงกับ id ที่ต้องการ
      const config = data.find(drone => drone.drone_id == id);

      if (!config) {
          return res.status(404).send('Drone not found');
      }

      // ตั้งค่า max_speed ตามเงื่อนไข
      const maxSpeed = config.max_speed ? Math.min(config.max_speed, 110) : 100;

      const result = {
        drone_id: config.drone_id,
        drone_name: config.drone_name,
        light: config.light,
        country: config.country,
        max_speed: maxSpeed
      };
      
      console.log(result)
      res.json(result);
  } catch (error) {
      console.error('Error details:', error); // เพิ่มการพิมพ์รายละเอียดของข้อผิดพลาด
      res.status(500).send('Error fetching drone config');
  }
});



// GET /status/:id
app.get('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${DRONE_CONFIG_URL}?drone_id=${id}`);
        
        // แสดงผลข้อมูลที่ได้จาก API เพื่อตรวจสอบโครงสร้าง
        // console.log(response.data); 

        // ตรวจสอบว่า response.data มีฟิลด์ data หรือไม่
        if (!response.data.data) {
            return res.status(500).send('Invalid response from API');
        }

        let data = response.data.data;  // เข้าถึงฟิลด์ data

        // หาโดรนที่มี drone_id ตรงกับ id ที่ต้องการ
        const config = data.find(drone => drone.drone_id == id);

        if (!config) {
            return res.status(404).send('Drone not found');
        }

        // ดึง condition ของโดรน
        const condition = config.condition;

        res.json({ condition });
    } catch (error) {
        console.error(error);  // เพิ่มการแสดงผล error เพื่อ debug
        res.status(500).send('Error fetching drone status');
    }
});


// GET /logs
app.get('/logs', async (req, res) => {
  try {
      const response = await axios.get(DRONE_LOGS_URL);
      const logs = response.data.items;

      // ตรวจสอบการมีอยู่ของฟิลด์ light
      const formattedLogs = logs.map(log => ({
          drone_id: log.drone_id,
          drone_name: log.drone_name,
          created: log.created,
          light: log.light,  // ดึงฟิลด์ light ออกมาโดยตรง
          country: log.country,
          celsius: log.celsius,
          population: log.population
      }));
      console.log(logs)
      res.json(formattedLogs);
  } catch (error) {
      console.error(error);  // เพิ่มการแสดง error ใน console
      res.status(500).send('Error fetching logs');
  }
});


app.post('/logs', async (req, res) => {
    try {
        const response = await axios.post(DRONE_LOGS_URL, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        res.status(response.status).send("ok");
    } catch (error) {
        console.error('Error posting logs:', error);
        res.status(500).send('Error saving log data');
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
test
