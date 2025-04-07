import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  // we use this hook to get the error that was thrown
  // PS: in real world app we want to log this somewhere permanent using
  // a log service, for now will use the console
  const error = useRouteError();
  console.log(error);

  // to tell the user this page donesn't exist
  // if true, user tried to access invalid browser

  return (
    <>
      <h1>Oops...</h1>
      <p>
        {isRouteErrorResponse(error)
          ? "Invalid Page"
          : "Sorry, an unexpected error has occurred."}
      </p>
    </>
  );
};

export default ErrorPage;
