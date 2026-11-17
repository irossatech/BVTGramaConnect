// The Citizen requests / Services list switch on the Services page; the requests tab shows how many are new.
import type { View } from "../Console";
import { SegmentTabs } from "../ui/parts";

export default function ServiceTabs({ v }: { v: View }) {
  return <SegmentTabs items={v.svcTabs} label="Services" />;
}
