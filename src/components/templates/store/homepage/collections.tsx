import { useState } from "react";
import Section from "@/components/base/common/section";
import CollectionContainer from "@/components/containers/store/collection-container";
import { Button } from "@/components/ui/button";
import StarSolidIcon from "@/components/ui/icons/star-solid";

export default function Collections() {
  const tabs = ["All", "Properties", "Vehicles", "Jobs"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>("Properties");

  return (
    <Section
      title="We sell all kind of products"
      description="From used to new products"
      rightAsset={
        <StarSolidIcon className="@5xl:h-[316px] @6xl:h-[386px] h-20 @5xl:w-[301px] @6xl:w-[246px]" />
      }
    >
      <div className="@4x:px-12 @6xl:px-[60px] @7xl:px-20 px-5 pb-8">
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={active === tab ? "default" : "ghost"}
              className="@6xl:h-14 h-12 @6xl:px-6 px-4 py-3 text-lg"
              type="button"
              onClick={() => setActive(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>
      <CollectionContainer />
    </Section>
  );
}
