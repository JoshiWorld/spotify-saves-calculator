import { BlogWithSearch } from "../_components/blog/blog-landing";
import { RoadmapPage } from "../_components/blog/roadmap";

export default async function BlogPage() {
  return (
    <div className="bg-background">
      <div id="blogs">
        <BlogWithSearch />
      </div>
      <div id="roadmap">
        <RoadmapPage />
      </div>
      {/* <div id="stats">
        <p>Placeholder stats</p>
      </div> */}
    </div>
  );
}
