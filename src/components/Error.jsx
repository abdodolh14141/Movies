const Error = ({ message, onRetry }) => (
  <div
    role="alert"
    className="flex flex-col justify-center items-center h-screen"
  >
    <p className="text-lg text-red-500 font-semibold mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
    >
      Retry
    </button>
  </div>
);

export default Error;
