import PostForm from "@/components/post-form";
import {createPost} from "@/actions/posts";
import {getPosts} from "@/lib/posts";

// export const metadata = {
//     title: 'All posts',
//     description: 'Browse all our posts!'
// }

export async function generateMetadata() {
    // can have data/config arg with params and stuff
   const posts =  await getPosts();
   const numberOfPosts = posts.length;
   return {
       title: `Browse all our ${numberOfPosts} posts.`,
       description: 'Browse all our posts.'
   }
}
export default function NewPostPage() {
    return <PostForm action={createPost}/>
}
