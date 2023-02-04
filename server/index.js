import express from "express";
import mongoose from "mongoose";
import cors from 'cors'
import mongo_url from "./config.js";


// Set the strict query to false to avoid any errors
mongoose.set('strictQuery', false)

// Initialize express
const app = express();

// Use JSON format for requests and responses
app.use(express.json());

// Use CORS for allowing cross-origin requests
app.use(cors());

const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongo_url, (err) => {
  if (err) {
    console.log(err.message)
  } else {
    console.log('db connected')
  }
});

// Define the seat schema
const seatSchema = new mongoose.Schema({
  seatNumber: { type: Number, unique: true },
  isAvailable: { type: Boolean, default: true },
  rowNumber: { type: Number }
});

const Seat = mongoose.model('Seat', seatSchema);

// Code to add documents to the database (This is used only once)

// const docs = [];
// for (let i = 1; i <= 80; i++) {
//   let rn = Math.floor((i-1)/7)
//   docs.push({
//     seatNumber: i,
//     isAvailable: true,
//     rowNumber: rn
//   });
// }

// Seat.create(docs, function (err, docs) {
//   if (err) return handleError(err);
//   console.log("docs added");
// });

// GET request to retrieve all seats
app.get('/api/seats', (req, res) => {
  Seat.find({}).sort({ seatNumber: 1 }).exec((err, seats) => {
    if (err) {
      res.send(err);
    } else {
      res.json(seats);
    }
  });
});


// POST request to book seats
app.post('/api/book', async (req, res) => {
  const { seatsToBook } = req.body;
  const seatNumberBooked = await bookSeats(Seat, seatsToBook);
  if (seatNumberBooked.length === 0) {
    return res.status(400).json({ error: 'No seats available.' });
  }

  res.json({ SeatNumberBooked: seatNumberBooked });
});


// Start the express server and listen on the specified port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


// Function to book seats
async function bookSeats(Seat, seatsToBook) {
  let seatNumberBooked = [];

  const availableSeats = await Seat.find({ isAvailable: true }).sort({ seatNumber: 1 });

  // Check if there are enough seats in a row
  function hasSeatsInaRow(array, num) {
    const valueCounts = {};
    for (let i = 0; i < array.length; i++) {
      if (valueCounts[array[i].rowNumber] === undefined) {
        valueCounts[array[i].rowNumber] = 1;
      } else {
        valueCounts[array[i].rowNumber]++;
        if (valueCounts[array[i].rowNumber] === Number(num)) {
          return array[i].rowNumber;
        }
      }
    }
    return -1;
  }

  // If there are enough seats in a row, book those seats
  let rowNum = hasSeatsInaRow(availableSeats, seatsToBook);
  if (rowNum >= 0) {
    const seatsThatWillbeBooked = await Seat.find({
      isAvailable: true,
      rowNumber: rowNum
    }).sort({ seatNumber: 1 }).limit(seatsToBook);

    for (let i = 0; i < seatsToBook; i++) {
      let seat = seatsThatWillbeBooked[i];
      seat.isAvailable = false;
      await seat.save();
      seatNumberBooked.push(seat.seatNumber);
    }
  } else {
    // Generate combinations of available seats
    const combinationOfSeats = generateCombinations(availableSeats, seatsToBook)

    // Find the combination with the least difference between the first and last seat numbers
    const seatsThatShouldBeBooked = findArrayWithLeastDifference(combinationOfSeats)
    for (let i = 0; i < seatsThatShouldBeBooked.length; i++) {
      let seatNum = seatsThatShouldBeBooked[i];
      let seat = await Seat.findOne({ seatNumber: seatNum })
      seat.isAvailable = false
      await seat.save()
      seatNumberBooked.push(seat.seatNumber)
    }
  }
  return seatNumberBooked;
}

function generateCombinations(array, Inputnumber) {
  let result = [];

  function backtrack(start, combination) {
    if (combination.length === Number(Inputnumber)) {
      result.push([...combination]);
      return;
    }

    for (let i = start; i < array.length; i++) {
      combination.push(array[i].seatNumber);
      backtrack(i + 1, combination);
      combination.pop();
    }
  }

  backtrack(0, []);

  return result;
}

function findArrayWithLeastDifference(arrays) {
  let minDifference = Number.MAX_SAFE_INTEGER;
  let resultArray = [];
  arrays.forEach(array => {
    const sortedArray = array.sort((a, b) => a - b);
    const difference = sortedArray[sortedArray.length - 1] - sortedArray[0];
    if (difference < minDifference) {
      minDifference = difference;
      resultArray = sortedArray;
    }
  });
  return resultArray;
}




