import mysql from 'mysql';

// const mysqlConnection = mysql.createConnection({
//     host: 'localhost',
//     database: 'mta_local',
//     user: 'root',
//     password: ''
// });

const mysqlConnection = mysql.createConnection(process.env.DATABASE_URL);

mysqlConnection.connect(function (error) {
    if (error) {
        console.log(error);
        throw error;
    }
    else {
        console.log('MySQL Database is connected Successfully');
    }
});

export default mysqlConnection;

// demo code
/*
mysqlConnection.query('SELECT COUNT(*) AS Total FROM all_users', function (error, data) {

    const total_records = data[0].Total;
}); 

*/