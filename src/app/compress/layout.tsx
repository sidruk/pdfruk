import { createToolRoute } from "@/lib/seo/tool-route";

const { metadata, ToolRouteLayout } = createToolRoute("/compress");

export { metadata };
export default ToolRouteLayout;
