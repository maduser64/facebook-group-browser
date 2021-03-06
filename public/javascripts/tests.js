﻿QUnit.config.autostart = false;

var objectId = '9973986703';
var limit = 250;
var groupString = 'group';

function ensureErrorIsNull(error, assert){
  assert.equal(error, null, "error property is null");
}

function ensureErrorIsUserError(error, assert){
  assert.ok(error && error instanceof UserError, 
    "error property is a UserError");
}

function ensurePostsAreNull(posts, assert){
  assert.equal(posts, null, "posts are null");
}

QUnit.module("loadObjectId");

QUnit.test("loadObjectId returns correct ID for group", function(assert) {
  var done = assert.async();
  loadObjectId("شباب 6 ابريل .. APRIL 6 YOUTH MOVEMENT", groupString, 
    function(error, id){
      ensureErrorIsNull(error, assert);
      assert.equal(id, objectId, "correct ID is returned"); 
      done();         
    }
  );
});

QUnit.test("loadObjectId returns correct ID for page", function(assert) {
  var done = assert.async();
  loadObjectId("Justin Bieber", "page", 
    function(error, id){
      ensureErrorIsNull(error, assert);
      assert.equal(id, '67253243887', "correct ID is returned"); 
      done();         
    }
  );
});

QUnit.test("loadObjectId errors with incorrect object name", function(assert) {
  var done = assert.async();
  loadObjectId("1716605E-36AB-4394-AB4A-2E5FAEA37BAD", groupString, 
    function(error, id){
      ensureErrorIsUserError(error, assert);
      assert.equal(id, null, "ID is null"); 
      done();         
    }
  );
});

QUnit.module("filterOutPostsOlderThanDate");

QUnit.test("filterOutPostsOlderThanDate handles empty array", function(assert) {
  var result = filterOutPostsOlderThanDate([], new Date());
  assert.deepEqual(result, [], "returns an empty array");
});

var filterOutPostsOlderThanDateOddInput =  [
  {index: 0, created_time: "2008-03-25T00:00:00+0000"},
  {index: 1, created_time: "2008-03-24T00:00:00+0000"},
  {index: 2, created_time: "2008-03-23T00:00:00+0000"}
];
var filterOutPostsOlderThanDateEvenInput = 
  filterOutPostsOlderThanDateOddInput.concat([  
    {index: 3, created_time: "2008-03-22T00:00:00+0000"}]);
var filterOutPostsOlderThanDateOutput = [
  {index: 0, created_time: "2008-03-25T00:00:00+0000"},
  {index: 1, created_time: "2008-03-24T00:00:00+0000"}
];
var cutoff = new Date("2008-03-23T12:00:00Z");

QUnit.test("filterOutPostsOlderThanDate handles array of even length",
  function(assert) {
    var result = filterOutPostsOlderThanDate(
      filterOutPostsOlderThanDateEvenInput, cutoff);
    assert.deepEqual(result, filterOutPostsOlderThanDateOutput, 
      "returns correct subset of array elements");
});

QUnit.test("filterOutPostsOlderThanDate handles array of odd length",
  function(assert) {
   var result = filterOutPostsOlderThanDate(
      filterOutPostsOlderThanDateOddInput, cutoff);
    assert.deepEqual(result, filterOutPostsOlderThanDateOutput, 
      "returns correct subset of array elements");
});

QUnit.test(
  "filterOutPostsOlderThanDate handles whole array of older entries",
  function(assert) {
    var result = filterOutPostsOlderThanDate(
      filterOutPostsOlderThanDateOddInput, 
      new Date("2008-03-26T00:00:00Z"));
    assert.deepEqual(result, [], 
      "returns correct subset of array elements");
});
 QUnit.test(
  "filterOutPostsOlderThanDate handles whole array of newer entries",
  function(assert) {
    var result = filterOutPostsOlderThanDate(
      filterOutPostsOlderThanDateOddInput, 
      new Date("2008-03-22T00:00:00Z"));
    assert.deepEqual(result, filterOutPostsOlderThanDateOddInput, 
      "returns correct subset of array elements");
});

QUnit.module("loadPosts");

QUnit.test(
  "loadPosts validates its startDate input",
  function(assert){
    var done = assert.async();
    loadPosts(
      NaN, new Date("2008-03-25T00:00:00Z"), limit, objectId,
      groupString, function(error, posts){
        ensureErrorIsUserError(error, assert);
        ensurePostsAreNull(posts, assert);
        done();
      });
  }
);

QUnit.test(
  "loadPosts validates its endDate input",
  function(assert){
    var done = assert.async();
    loadPosts(
      new Date("2008-03-25T00:00:00Z"), -1, limit, objectId,
      groupString, function(error, posts){
        ensureErrorIsUserError(error, assert);
        ensurePostsAreNull(posts, assert);
        done();
      });
  }
);

QUnit.test(
  "loadPosts validates its limit input",
  function(assert){
    var done = assert.async();
    loadPosts(
      new Date("2008-03-25T00:00:00Z"),
      new Date("2008-03-25T00:12:00Z"), 0, objectId,
      groupString, function(error, posts){
        ensureErrorIsUserError(error, assert);
        ensurePostsAreNull(posts, assert);
        done();
      });
  }
);

QUnit.test(
  "loadPosts validates its objectId input",
  function(assert){
    var done = assert.async();
    loadPosts(
      new Date("2008-03-25T00:00:00Z"),
      new Date("2008-03-25T00:12:00Z"), limit, null,
      groupString, function(error, posts){
        ensureErrorIsUserError(error, assert);
        ensurePostsAreNull(posts, assert);
        done();
      });
  }
);

QUnit.test(
  "loadPosts validates its objectType input",
  function(assert){
    var done = assert.async();
    loadPosts(
      new Date("2008-03-25T00:00:00Z"),
      new Date("2008-03-25T00:12:00Z"), limit, objectId,
      "bananas", function(error, posts){
        ensureErrorIsUserError(error, assert);
        ensurePostsAreNull(posts, assert);
        done();
      });
  }
);

function loadPostsWithinRange(assert, limit, specificValidation){
  var done = assert.async();
  loadPosts(
    new Date("2008-03-25T00:00:00Z"),
    new Date("2008-03-25T00:12:00Z"),
    limit,
    objectId, groupString, 
    function (error, posts){
      ensureErrorIsNull(error, assert);
      var message = "the ID for each result matches";
      assert.equal(posts[0].id, "9973986703_10150512342751704",
        message);
      specificValidation(posts, message);
      done();
    }); 
}

QUnit.test(
  "loadPosts loads correct entries with data available both " +
  "before and after range without hitting the limit",
  function(assert) {
    loadPostsWithinRange(assert, 100, function (posts, message){
      assert.equal(posts.length, 3, "there are only 3 results");
      assert.equal(posts[1].id, "9973986703_10150512342736704", message);
      assert.equal(posts[2].id, "9973986703_10150512342716704", message);
    }); 
});

QUnit.test(
  "loadPosts loads correct entries with data available both " +
  "before and after range while hitting the limit",
  function(assert) {
    loadPostsWithinRange(assert, 1, function (posts, message){
      assert.equal(posts.length, 1, "there is only 1 result");
    }); 
});

function loadPostsNoDataStartOfRange(assert, limit, specificValidation){
  var done = assert.async();
  loadPosts(
    new Date("2008-03-22T19:00:00Z"),
    new Date("2008-03-22T21:00:00Z"),
    limit,
    objectId, groupString, 
    function (error, posts){
      ensureErrorIsNull(error, assert);
      var message = "the ID for each result matches";
      assert.equal(posts[0].id, "9973986703_10150512334081704",
        message);
      specificValidation(posts, message);
      done();
    }); 
}

QUnit.test(
  "loadPosts loads correct entries with no data at the start of the range" +
  " without hitting the limit",
  function(assert) {
    loadPostsNoDataStartOfRange(assert, 100, function (posts, message){
      assert.equal(posts.length, 3, "there are only 3 results");
      assert.equal(posts[1].id, "9973986703_10150512334061704", message);
      assert.equal(posts[2].id, "9973986703_10150512334041704", message);
    }); 
});

QUnit.test(
  "loadPosts loads correct entries with no data at the start of the range" +
  " while hitting the limit",
  function(assert) {
    loadPostsWithinRange(assert, 1, function (posts, message){
      assert.equal(posts.length, 1, "there is only 1 result");
    }); 
});