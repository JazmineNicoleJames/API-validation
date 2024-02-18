const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");



const router = new express.Router();

router.post("/with-validation", function(req, res, next){
  console.log('made it to validation')
  const result = jsonschema.validate(req.body, bookSchema);
  console.log('result', result)
  if(!result.valid){
    console.log('result not valid')
    let listOfErrors = result.errors.map(error => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }
  const { book } = req.body;
  return res.json(book)
})

/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {

  try {
    const result = jsonschema.validate(req.body, bookSchema);
    console.log('result', result)

    if(!result.valid){
      return next({
        status: 400,
        error: result.errors.map(e => e.stack)
      });
/*       let error = new ExpressError("All book data required", 400)
      return next(error) */
    }

    const book = await Book.create(req.body.book);

    return res.status(201).json({ book });

  } catch (err) {
    console.error('error', err)
    console.log('err.name', err)
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {

    const updatedBook = await Book.update(req.params.isbn, req.body);

    if(!updatedBook){

      let error = new ExpressError("Book data required")
      
      return next(error)
    }

    return res.json({updatedBook});

  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
