var entryId = "abcde";

var version = "";

client.media.get(function(results) {
  if (results && results.code && results.message) {
    console.log('Kaltura Error', results);
  } else {
    console.log('Kaltura Result', results);
  }
},
entryId,
version);
