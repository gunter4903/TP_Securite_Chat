const pool = require('../scripts/mysql');

const getCats = async () => {
    const [rows] = await pool.execute('SELECT id, name, birthday FROM cats ');
    return rows;
}

module.exports = {
    getCats
};