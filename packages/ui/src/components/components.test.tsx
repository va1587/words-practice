import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "./badge";
import { Button, buttonVariants } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Separator } from "./separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

afterEach(cleanup);

describe("Button", () => {
  it("renders a native button with default variant and size", () => {
    render(<Button className="extra">Zapisz</Button>);
    const button = screen.getByRole("button", { name: "Zapisz" });
    expect(button).toHaveProperty("dataset.slot", "button");
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("extra");
  });

  it("applies variants and sizes", () => {
    render(
      <Button variant="outline" size="sm">
        Anuluj
      </Button>,
    );
    expect(screen.getByRole("button").className).toContain("border-border");
    expect(buttonVariants({ variant: "ghost", size: "icon" })).toContain("size-8");
  });
});

describe("Badge", () => {
  it("renders a span with the default variant", () => {
    render(<Badge>Nowa</Badge>);
    const badge = screen.getByText("Nowa");
    expect(badge.tagName).toBe("SPAN");
    expect(badge.className).toContain("bg-primary");
  });

  it("supports variants and a custom render element", () => {
    render(
      <Badge variant="outline" render={<a href="/x" />}>
        Link
      </Badge>,
    );
    const badge = screen.getByRole("link", { name: "Link" });
    expect(badge.className).toContain("border-border");
    expect(badgeVariants({ variant: "destructive" })).toContain("text-destructive");
  });
});

describe("Card", () => {
  it("renders all slots", () => {
    render(
      <Card size="sm" className="extra">
        <CardHeader>
          <CardTitle>Tytuł</CardTitle>
          <CardDescription>Opis</CardDescription>
          <CardAction>Akcja</CardAction>
        </CardHeader>
        <CardContent>Treść</CardContent>
        <CardFooter>Stopka</CardFooter>
      </Card>,
    );
    const card = screen.getByText("Treść").closest('[data-slot="card"]');
    expect(card?.getAttribute("data-size")).toBe("sm");
    expect(card?.className).toContain("extra");
    for (const [text, slot] of [
      ["Tytuł", "card-title"],
      ["Opis", "card-description"],
      ["Akcja", "card-action"],
      ["Treść", "card-content"],
      ["Stopka", "card-footer"],
    ] as const) {
      expect(screen.getByText(text).getAttribute("data-slot")).toBe(slot);
    }
  });

  it("defaults to the regular size", () => {
    render(<Card>X</Card>);
    expect(screen.getByText("X").getAttribute("data-size")).toBe("default");
  });
});

describe("Table", () => {
  it("renders a scrollable table with all parts", () => {
    render(
      <Table>
        <TableCaption>Ścieżki</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tytuł</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>React</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Razem</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const table = screen.getByRole("table", { name: "Ścieżki" });
    expect(table.parentElement?.getAttribute("data-slot")).toBe("table-container");
    expect(screen.getByRole("columnheader", { name: "Tytuł" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "React" }).getAttribute("data-slot")).toBe(
      "table-cell",
    );
    expect(screen.getAllByRole("rowgroup").map((g) => g.getAttribute("data-slot"))).toEqual([
      "table-header",
      "table-body",
      "table-footer",
    ]);
  });
});

describe("Separator", () => {
  it("is horizontal by default and supports vertical orientation", () => {
    const { container, rerender } = render(<Separator />);
    const separator = () => container.querySelector('[data-slot="separator"]');
    expect(separator()?.getAttribute("aria-orientation")).not.toBe("vertical");

    rerender(<Separator orientation="vertical" className="extra" />);
    expect(separator()?.getAttribute("aria-orientation")).toBe("vertical");
    expect(separator()?.className).toContain("extra");
  });
});
