import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { Card, CardContent, CardHeader, Grid, Typography } from "@material-ui/core";
import { viewAndDeleteSampleLineItem } from '../../../apis'
import Button from "../../../components/Button";
import "../../common.css";
import AuditLog from "./AuditLog";
import { numberWithCommas } from "../../common";
import { useNavigate, useParams } from 'react-router-dom';
import Snackbar from "../../../components/Snackbar";

const ViewSampleItem = (props) => {
  const navigate = useNavigate();
  const { sampleId, sampleItemId } = useParams();
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [sample, setSampleInfo] = useState({});

  useEffect(() => {
    viewAndDeleteSampleLineItem({
      type: "viewsamplelineitem",
      lineitem_id: parseInt(sampleItemId),
    }).then((res) => {
      setSampleInfo(res);
    }).catch(e => {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data //e.message
        severity: "error",
      })
    });
  }, [sampleItemId]);

  const payload = [
    {
      type: "label",
      value: "Product Type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.product_type,
      sm: "6",
    },
    {
      type: "label",
      value: "Description",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.description,
      sm: "6",
    },
    {
      type: "label",
      value: "Sample category",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.sample_category,
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Target",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.targetprice_enabled === false ? 'No' : 'Yes',
      sm: "6",
    },
    {
      type: "label",
      value: "Target Price",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: sample.target_price === '' ? '-' : numberWithCommas(sample.target_price),
      sm: "6",
    },
  ];

  return (
    <>
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}
      <>
        <Card className="page-header">
          <CardHeader
            title="Sample request line item details"
            className="cardHeader"
          />
          <CardContent>
            <Grid id="top-row" container>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload} />
              </Grid>
              <Grid id="top-row" xs={12} md={6} container direction="column">
                <Template payload={payload1} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid id="top-row" container style={{ margin: 6 }}>
          <Grid item md={12} xs={12} className="item">
            <Typography>Audit log information</Typography>
          </Grid>
        </Grid>
        <AuditLog data={sample.audit_log} />

        <Grid container xs={12} md={12} style={{ margin: 24 }} justify="center">
          <Grid item>
            <Button
              label="Edit"
              onClick={() => navigate(`/sample-request/${encodeURIComponent(sampleId)}/sample-item/${encodeURIComponent(sampleItemId)}/edit`)}
            />
          </Grid>
          <Grid item>
            <Button label="Back" onClick={() => navigate(-1, { replace: true })} />
          </Grid>
        </Grid>
      </>
    </>
  );
};

export default ViewSampleItem;
