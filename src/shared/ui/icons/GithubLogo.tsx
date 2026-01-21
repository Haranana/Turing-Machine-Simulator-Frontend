import type { ComponentProps } from "react";
import { MarkGithubIcon } from "@primer/octicons-react";

type Props = {
  size?: number;
} & Omit<ComponentProps<"svg">, "children">;

export function GithubLogo({ size = 24, ...svgProps }: Props) {
  return (
    <MarkGithubIcon
      size={size}     
      {...svgProps}
    />
  );
}