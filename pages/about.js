import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaLaptop, FaTwitter } from "react-icons/fa";

function about() {
  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900">
      <Navbar />
      <div className="max-w-2xl pt-20 pb-32 px-6 text-center mx-auto">
        <div className="h-64 w-full justify-center flex">
          <img src="/about.jpg" className="h-64" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-700 py-4 dark:text-gray-200">
          Hi,{" "}
          <span className="bg-indigo-400 text-white rounded px-1 dark:bg-indigo-500">
            I’m Thanga
          </span>{" "}
        </h2>
        <p className="text-gray-600 mt-4 dark:text-indigo-200">
          I am a Front-end Developer.I like to code things from scratch, I like dabbling in various parts of frontend development and like to learn about new technologies, read technical articles or simply play games in my free time.
        </p>

        <div className="text-center pt-8">
          <button className="bg-indigo-500 px-3 py-1 font-semibold text-white inline-flex items-center space-x-2 rounded dark:bg-indigo-600">
            <FaLaptop />
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://thangamariappan.vercel.app"
            >
              Portfolio
            </a>
          </button>

          <button className="bg-indigo-500 px-3 py-1 font-semibold text-white inline-flex items-center space-x-2 rounded ml-3 dark:bg-indigo-600">
            <FaTwitter />
            <a
              className="twitter-follow-button"
              rel="noopener noreferrer"
              target="_blank"
              href="https://twitter.com/iamthangam"
            >
              Follow Me
            </a>
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default about;
