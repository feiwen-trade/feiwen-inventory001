const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化数据库
const db = new sqlite3.Database('./inventory.db', (err) => {
    if (err) console.error('数据库连接失败:', err);
    else console.log('数据库连接成功');
    
    // 创建入库表
    db.run(`CREATE TABLE IF NOT EXISTS inbound (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country TEXT,
        wh TEXT,
        name TEXT,
        sku TEXT,
        qty INTEGER,
        price REAL,
        date TEXT,
        create_time INTEGER
    )`);

    // 创建出库表
    db.run(`CREATE TABLE IF NOT EXISTS outbound (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT,
        country TEXT,
        wh TEXT,
        link TEXT,
        qty INTEGER,
        date TEXT,
        create_time INTEGER
    )`);
});

// ========== 接口 ==========
// 获取所有数据
app.get('/api/data', (req, res) => {
    const data = { inbound: [], outbound: [] };
    
    db.all('SELECT * FROM inbound ORDER BY create_time DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        data.inbound = rows;
        
        db.all('SELECT * FROM outbound ORDER BY create_time DESC', (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            data.outbound = rows;
            res.json(data);
        });
    });
});

// 新增入库
app.post('/api/inbound', (req, res) => {
    const { country, wh, name, sku, qty, price, date } = req.body;
    const create_time = Date.now();
    db.run(
        `INSERT INTO inbound (country, wh, name, sku, qty, price, date, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [country, wh, name, sku, qty, price, date, create_time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// 新增出库
app.post('/api/outbound', (req, res) => {
    const { sku, country, wh, link, qty, date } = req.body;
    const create_time = Date.now();
    db.run(
        `INSERT INTO outbound (sku, country, wh, link, qty, date, create_time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sku, country, wh, link, qty, date, create_time],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID });
        }
    );
});

// 编辑入库
app.put('/api/inbound/:id', (req, res) => {
    const { id } = req.params;
    const { country, wh, name, sku, qty, date } = req.body;
    db.run(
        `UPDATE inbound SET country=?, wh=?, name=?, sku=?, qty=?, date=? WHERE id=?`,
        [country, wh, name, sku, qty, date, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// 编辑出库
app.put('/api/outbound/:id', (req, res) => {
    const { id } = req.params;
    const { sku, country, wh, link, qty, date } = req.body;
    db.run(
        `UPDATE outbound SET sku=?, country=?, wh=?, link=?, qty=?, date=? WHERE id=?`,
        [sku, country, wh, link, qty, date, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

// 删除入库
app.delete('/api/inbound/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM inbound WHERE id=?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 删除出库
app.delete('/api/outbound/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM outbound WHERE id=?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// 启动服务
app.listen(PORT, () => {
    console.log(`服务运行在端口 ${PORT}`);
});
