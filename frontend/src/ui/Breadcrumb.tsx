import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";

function BreadcrumbComponent({ links }: { links: string[] }) {
  const allLinks = links.map((item, index) => {
    const path =
      "/" +
      links
        .slice(0, index + 1)
        .map((i) => i.toLowerCase())
        .join("/");
    return { name: item, path };
  });

  console.log("Breadcrumb Links:", allLinks);
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {allLinks.map((link, index) => (
            <div className="" key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink href={link.path}> {link.name}</BreadcrumbLink>
                {index !== links.length - 1 && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

export default BreadcrumbComponent;
