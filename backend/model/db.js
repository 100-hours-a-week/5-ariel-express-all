import mysql from 'mysql2/promise';

// MySQL 데이터베이스 연결 설정
const db = mysql.createPool({
    host: 'localhost',
    user: 'yeji',       // MySQL 사용자 이름
    password: 'yj991010*', // MySQL 사용자 비밀번호
    database: 'kcs_community', // 사용할 데이터베이스 이름
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default db;
