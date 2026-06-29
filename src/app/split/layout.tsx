import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/split");

export { metadata };
export default ToolRouteLayout;
