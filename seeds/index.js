const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const camground = require("../models/campground");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("mongo connection open");
  })
  .catch((err) => {
    console.log("error on mongo");
    consloe.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const randPrice = Math.floor(Math.random() * 20) + 10;

const seedDb = async () => {
  await camground.deleteMany();
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new camground({
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state} `,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      image: [
        {
          url: "https://res.cloudinary.com/huycloud/image/upload/v1638086248/YelpCamp/t7qggwznjjatgj01am3f.jpg",
          filename: "YelpCamp/t7qggwznjjatgj01am3f",
        },
        {
          url: "https://res.cloudinary.com/huycloud/image/upload/v1638086249/YelpCamp/mdxdlcgz70dxtcbqypxz.jpg",
          filename: "YelpCamp/mdxdlcgz70dxtcbqypxz",
        },
      ],
      description: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel soluta autem amet, repellendus perspiciatis atque quae recusandae facere adipisci ipsum fugit voluptates suscipit veritatis, blanditiis voluptas accusamus dolorum officia. Modi.`,
      price: randPrice,
      author: "61979c407c62eb2e197b4c67",
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
