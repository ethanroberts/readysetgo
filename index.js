var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
  response.send('Hello Team G Elliot!');
});

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT * FROM agency', function(err, result) {
        done();
        if (err)
          { console.error(err); response.send("Error " + err); }
        else
          { response.send(result.rows); }
    });
  });
});

app.get('/db2', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT stop_id,stop_code,stop_name FROM stops WHERE stop_id = 11645', function(err, result) {
        done();
        if (err)
          { console.error(err); response.send("Error " + err); }
        else
          { response.send(result.rows); }
    });
  });
});

app.get('/db3', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query('SELECT trip_id,arrival_time,departure_time,stop_id,stop_sequence FROM stoptimes WHERE stop_id = 11645 LIMIT 15', function(err, result) {
        done();
        if (err)
          { console.error(err); response.send("Error " + err); }
        else
          { response.send(result.rows); }
    });
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
