import { Card, CardContent, Typography } from "@mui/material";

export function KpiCard(props: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {props.label}
        </Typography>
        <Typography variant="h5">
          {props.value}
        </Typography>
      </CardContent>
    </Card>
  );
}
