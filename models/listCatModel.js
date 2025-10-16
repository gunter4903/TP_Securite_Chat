const pool = require('../scripts/mysql');

const getCats = async () => {
    const [rows] = await pool.execute('SELECT id, name, birthday FROM cats ');
    for (const cat of rows) {
        console.log(cat.id);       // Affiche l'id du chat
        console.log(cat.name);     // Affiche le nom du chat
        console.log(cat.birthday); // Affiche l'anniversaire du chat
    }
    return rows;
}

module.exports = {
    getCats
};