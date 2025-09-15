import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb";
import React from "react";

interface BreadcrumbsProps {
  items: {
    title: string;
    url: string | null;
  }[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {items.slice(0, -1).map((item, key) => (
            <React.Fragment key={key}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={item.url || "#"}>
                  {item.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{items[items.length - 1]?.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
};
