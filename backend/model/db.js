import mysql from 'mysql2/promise';

// MySQL 데이터베이스 연결 설정
const db = mysql.createPool({
    host: 'localhost',
    user: 'yeji',
    password: 'yj991010*',
    database: 'kcs_community',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
