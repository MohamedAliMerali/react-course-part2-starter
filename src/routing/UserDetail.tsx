import { useLocation, useParams, useSearchParams } from "react-router-dom";

const UserDetail = () => {
  const params = useParams();
  console.log(params);
  // {id: '2'}
  // ps: that 2 value is a string be carefull

  const [searchParams, setSearchParams] = useSearchParams();
  // with this we can access and update the query string parameter
  console.log(searchParams); // URLSearchParams {size: 0}
  // not empty, this is the default way of rendering

  // http://localhost:5173/users/2?name=alice&age=25
  // console.log(searchParams.toString()); // name=alice&age=25
  // console.log(searchParams.get("name")); // alice

  const location = useLocation();
  // access the current location
  console.log(location);
  // {
  //   pathname: '/users/2',
  //   search: '?name=alice&age=25',
  //   hash: '',
  //   state: null,
  //   key: '4mf7y6pp'
  // }

  return <p>User {params.id}</p>;
};

export default UserDetail;
