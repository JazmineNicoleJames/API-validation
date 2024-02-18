process.env.NODE_ENV = "test";
const request = require("supertest");
const db = require("../db");
const Book = require("../models/book");
const app = require("../app")


describe("Test Book class", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM books");
    await db.query("DELETE FROM books");

    let b = await Book.create({
      isbn: "0",
      amazon_url: "fakeurl.com",
      author: "Test",
      language: "english",
      pages: 100,
      publisher: "fake publisher",
      title: "fake title",
      year: 2000
    });
  });



describe("POST /books", function() {

  test("can create book", async function () {

    let b = await Book.create({
        isbn: "01",
        amazon_url: "fakeurl1.com",
        author: "Test1",
        language: "english",
        pages: 100,
        publisher: "fake publisher",
        title: "fake title1",
        year: 2000
      });

    expect(b.isbn).toBe("01");
    expect(b.author).not.toBe(undefined);
  });

  test("Create book with missing data", async function () {

    let res = await request(app).post(`/books`).send( {       
        amazon_url: "fakeurl1.com",
        author: "Test1",
        language: "english",
        pages: 100,
        publisher: "fake publisher",
        title: "fake title1",
        year: 2000});

    expect(res.statusCode).toBe(400);
  });

  test("Create book with duplicate unique constraints", async function() {
    
    let res = await request(app).post(`/books`).send({ 
        isbn: "0",
        amazon_url: "fakeurl1.com",
        author: "Test1",
        language: "english",
        pages: 100,
        publisher: "fake publisher",
        title: "fake title1",
        year: 2000});

    expect(res.statusCode).toBe(400)
    });
});



describe("GET /books", function(){

    test("find all books", async function(){
        let res = await request(app).get(`/books`);

        expect(res.statusCode).toBe(200)
    })

    test("find book by isbn", async function(){
        let res = await request(app).get(`/books/0`);

        expect(res.statusCode).toBe(200)
        expect(res.body).toEqual({ book:{
            isbn: "0",
            amazon_url: "fakeurl.com",
            author: "Test",
            language: "english",
            pages: 100,
            publisher: "fake publisher",
            title: "fake title",
            year: 2000}})
    });

    test("find book by invalid isbn", async function(){
        let res = await request(app).get(`/books/k`);

        expect(res.statusCode).toBe(404)
    });
});



describe("PUT /books/:isbn", function(){ 
    test("update book", async function() {
        let res = await request(app).put(`/books/0`).send({
                "amazon_url": "http://a.co/eobPtX2",
                "author": "Rocco Marblessss",
                "language": "english",
                "pages": 500,
                "publisher": "Princeton University Press",
                "title": "Toe Beans",
                "year": 2024
        });

        expect(res.statusCode).toBe(200)
        expect(res.body.updatedBook.title).toEqual("Toe Beans")
    });
    test("Updating book with invalid isbn", async function() {
        let res = await request(app).put(`/books/k`).send({
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Rocco Marblessss",
            "language": "english",
            "pages": 500,
            "publisher": "Princeton University Press",
            "title": "Toe Beans",
            "year": 2024
        });

    expect(res.statusCode).toBe(404)
    });
});



describe("DELETE /books/:isbn", function(){ 

    test("Deleting a book", async function(){
        let res = await request(app).delete(`/books/0`);

        expect(res.statusCode).toBe(200)
    });

    test("Deleting a book with invalid isbn", async function() {
        let res = await request(app).delete(`/books/k`);

        expect(res.statusCode).toBe(404)
        expect(res.body.error.message).toEqual("There is no book with an isbn 'k")
    });
});
});


afterEach(async function(){

    await db.query("DELETE FROM books");
    const msg = await db.query("SELECT * FROM books");
    console.log('deleted msgs', msg.rows);

  })
  
  afterAll(async function() {
    await db.end();
  });