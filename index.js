var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

//app.get('/', function(request, response) {
//  response.send('Hello Team G Elliot!');
//});
app.get('/', function(req, res) {
  res.sendfile('index.html', {root: __dirname })
});

app.get('/stops/:id', function (request, response) {
  console.log('Call for id ', request.params.id);
  var sql = "SELECT stoptimes.trip_id, stop_sequence, arrival_time,stoptimes.stop_id, stop_code, stop_name, stop_desc, stop_lat, stop_lon FROM stoptimes INNER JOIN stops ON stops.stop_id = stoptimes.stop_id WHERE stoptimes.trip_id ="+request.params.id+";"
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      client.query(sql,function(err, result) {
        done();
        if (err)
          { console.error(err); response.send("Error " + err); }
        else
          { response.send(result.rows); }
    });
  });
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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
