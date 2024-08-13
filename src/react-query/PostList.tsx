import { Fragment } from "react";
import usePosts, { Post } from "./hooks/usePosts";

const PostList = () => {
  const pageSize = 10;
  const { data, error, isLoading, fetchNextPage, isFetchingNextPage } =
    usePosts({ pageSize });

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <ul className="list-group">
        {data.pages.map((page, index) => (
          // PS: don't forget the key attribute
          <Fragment key={index}>
            {page.map((post) => (
              <li key={post.id} className="list-group-item">
                {post.userId} {"- "}
                {post.title}
              </li>
            ))}
          </Fragment>
        ))}
      </ul>
      <button
        className="btn btn-primary my-3 ms-1"
        disabled={isFetchingNextPage}
        onClick={() => fetchNextPage()}
      >
        {/* to make the button dynamic */}
        {isFetchingNextPage ? "Loading..." : "Load More"}
      </button>
      {/* <button
        className="btn btn-primary my-3"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button> */}
      {/* <button
        className="btn btn-primary my-3 ms-1"
        onClick={() => setPage(page + 1)}
      >
        Next
      </button> */}
    </>
  );
};

// const PostList = () => {
//   const [userId, setUserId] = useState<number>();
//   const { data: posts, error, isLoading } = usePosts(userId);

//   if (error) return <p>{error.message}</p>;
//   if (isLoading) return <p>Loading...</p>;

//   return (
//     <>
//       <select
//         className="form-select mb-3"
//         value={userId}
//         onChange={(event) =>
//           setUserId(
//             // to avoid parsing the empty string into a number
//             isNaN(parseInt(event.target.value))
//               ? undefined
//               : parseInt(event.target.value)
//           )
//         }
//       >
//         <option value=""></option>
//         <option value="1">User 1</option>
//         <option value="2">User 2</option>
//         <option value="3">User 3</option>
//       </select>
//       <ul className="list-group">
//         {posts?.map((post) => (
//           <li key={post.id} className="list-group-item">
//             {post.userId} {"- "}
//             {post.title}
//           </li>
//         ))}
//       </ul>
//     </>
//   );
// };

export default PostList;
