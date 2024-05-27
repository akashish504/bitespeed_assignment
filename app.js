const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { Client } = require('pg');
const client = new Client('postgres://root:9rEpJDIUc7kdABiTAh5MbVc1m793Io8L@dpg-cp6r5q7sc6pc73cloucg-a.oregon-postgres.render.com/bitespeed_gulz?ssl=true');

client
  .connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
})
.catch((err) => {
  console.error('Error connecting to PostgreSQL database', err);
});

const app = express();

const checkUser =  async (req, res) => {
  if (!req.body.email) {
    req.body.email = ''
  }
  if (!req.body.email) {
    req.body.phonenumber = ''
  }
	client.query(`SELECT * FROM contact WHERE email = '`+ req.body.email + `';`, (err, result) => {
		let resp_email;
    if (err) {
			console.error('Error executing query', err);
		} else {
      resp_email = result.rows;
      client.query(`SELECT * FROM contact WHERE phonenumber = '`+ req.body.phone + `';`, (err, result) => {
        let resp_phone;
        if (err) {
          console.error('Error executing query', err);
        } else {
          resp_phone = result.rows;  
          let data = resp_email.concat(resp_phone);
          // let primary_doc = data.reduce((min, p) => p.createdat < min ? p.createdat : min, data[0].createdat);

          // console.log(primary_doc);
          let earlist_doc;
          for (let i = 0; i < data.length; i++) {
            if (i==0){
              earlist_doc = data[0]
            } else{
              if (data[i].createdat < earlist_doc.createdat ) {
                earlist_doc = data[i]
              }
            }
          }

          for (let i = 0; i < data.length; i++) {
            if (data[i].id != earlist_doc.id) {
              client.query(`UPDATE contact SET linkprecedence = 'secondary', linkedid = `+ earlist_doc.id + ` WHERE id = `+data[i].id+``, (err, result) => {
                if (err) {
                  console.error('Error executing query', err);
                }
              })
            }
          }

          return res.status(200).send({"data": "Sucessfully updated the data"});
        }
      })
    }
  })
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.post('/identify', checkUser);

// app.use('/', routes);
// celebrate errors
// app.use(errors());
const port = parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => {
  console.log(`listening to the port ${port}`);
});
