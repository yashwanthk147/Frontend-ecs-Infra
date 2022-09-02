import React, { useEffect, useState } from "react";
import Template from "../../../components/Template";
import ContentTabs from "../../../components/ContentTabs";
import Tab from "@material-ui/core/Tab";
import { Grid } from "@material-ui/core";
import { Typography } from "@material-ui/core";
import {
  getAccountDetails,
  getQuotes,
  reassignAccount,
  getUsers,
  getContacts,
  getSampleRequests,
} from "../../../apis";
import AccountContactList from "./AccountContactList";
import SampleRequestList from "../Sample Requests/SampleRequestList";
import { Container } from "@material-ui/core";
import AccountQuotesList from "./AccountQuotesList";
import Button from "../../../components/Button";
import Fab from "../../../components/Fab";
import "../../common.css";
import { makeStyles } from "@material-ui/core/styles";
import SimpleModal from "../../../components/Modal";
import Snackbar from "../../../components/Snackbar";
import _ from "lodash";
import { numberWithCommas } from "../../common";
import { withStyles } from "@material-ui/core/styles";
import roles from "../../../constants/roles";
import { routeBuilder } from "../../../utils/routeBuilder";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";


const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
    },
    '& .MuiGrid-root': {
      color: '#F05A30',
    },
    "& .MuiFormControl-fullWidth": {
      width: "95%",
    },
    flexGrow: 1,
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    "& #top-row": {
      marginTop: 10,
      marginBottom: 5,

    },
  },
  modal: {
    position: "absolute",
    margin: "auto",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 1000,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow: "scroll",
  },
}));

const WhiteTextTypography = withStyles({
  root: {
    color: "#F05A30"
  }
})(Typography);

const AccountDetails = (props) => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [searchParams] = useSearchParams();
  const tabId = searchParams.get('tab') || "details";
  const [accountDetails, setAccountDetails] = useState({});
  // eslint-disable-next-line
  const [contacts, setAccountContacts] = useState([]);
  const [samples, setAccountSamples] = useState([]);
  const [quotes, setAccountQuotes] = useState([]);
  const [usersToReAssign, setUsersToReAssign] = useState([]);

  const [openReAssign, setReAssign] = useState(false);
  const [reAssignUser, setReAssignUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSnack, setSnack] = useState({ open: false, message: "" });
  const userRole = localStorage.getItem("currentUserRole");
  const loggedinuserid = localStorage.getItem("currentUserId");

  const formatToSelectionUsers = (data = [], key) => {
    let formattedData = [];
    data?.map((v) =>
      formattedData.push({ label: v[key], value: v.userid || v[key] })
    );
    return formattedData;
  };

  useEffect(() => {
    getAccountDetails({
      viewaccount: true,
      accountid: accountId.toString(),
    }).then((res) => {
      setAccountDetails(res);
    });
    getUsers({ type: "Accounts", loginuserid: loggedinuserid }).then((res) => {
      setUsersToReAssign(formatToSelectionUsers(res, "username"));
    });
    // eslint-disable-next-line
  }, []);

  async function fetchData() {
    let response = await getContacts({
      filter: `accountid = ${accountId}`,
    });
    setAccountContacts(response);
    let quotesa = await getQuotes({
      filter: `accountid = ${accountId}`,
    });
    setAccountQuotes(quotesa);
    let samplesa = await getSampleRequests({
      filter: `accountid = ${accountId}`,
    });
    setAccountSamples(samplesa);
  }
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);
  const handleChange7 = (e, value) => {
    e.preventDefault();
    setReAssignUser(value);
  };
  const reAssignAccountToUser = async (e) => {
    try {
      if (_.isEmpty(reAssignUser?.value)) {
        setSnack({
          open: true,
          severity: "error",
          message: "Please select a user to reassign",
        });
        setTimeout(() => {
          setSnack({
            open: false,
            message: "",
          });
        }, 2000);
        return;
      }
      let payload = {
        accountid: accountId?.toString(),
        userid: reAssignUser?.value,
        loggedinuserid: loggedinuserid,
      };
      setLoading(true);
      let response = await reassignAccount(payload);
      console.log("Response", response);
      if (response) {
        let responseMessage = "Account reassigned successfully";
        setSnack({
          open: true,
          message: responseMessage,
        });
        setTimeout(() => {
          navigate('/accounts', { replace: true });
        }, 2000);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  const payload = [
    {
      type: "label",
      value: "Account owner",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accountowner,
      sm: "6",
    },
    {
      type: "label",
      value: "Account type",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accounttypes
        ?.map((acc) => {
          return acc.accounttype;
        })
        ?.join(","),
      sm: "6",
    },
    {
      type: "label",
      value: "Phone",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.phone,
      sm: "6",
    },
    {
      type: "label",
      value: "Fax",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.fax,
      sm: "6",
    },
    {
      type: "label",
      value: "Approx. annual turnover ($) ",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: numberWithCommas(accountDetails?.approxannualrev),
      sm: "6",
    },
  ];

  const payload1 = [
    {
      type: "label",
      value: "Account name",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.accountname,
      sm: "6",
    },
    {
      type: "label",
      value: "Aliases",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.aliases,
      sm: "6",
    },
    {
      type: "label",
      value: "Email",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.email,
      sm: "6",
    },
    {
      type: "label",
      value: "Website",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.website,
      sm: "6",
    },
    {
      type: "label",
      value: "Product segment",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.Productsegment?.map((ps) => {
        return ps.productsegment;
      })?.join(","),
      sm: "6",
    },
  ];

  const payload2 = [
    {
      type: "label",
      value: "Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_street,
      sm: "6",
    },
    {
      type: "label",
      value: "City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Province/State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Postal code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_postalcode,
      sm: "6",
    },
    {
      type: "label",
      value: "Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.shippinginformation &&
        accountDetails.shippinginformation[0]?.shipping_country,
      sm: "6",
    },
  ];

  const payload3 = [
    {
      type: "label",
      value: "Street",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_street,
      sm: "6",
    },
    {
      type: "label",
      value: "City",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_city,
      sm: "6",
    },
    {
      type: "label",
      value: "Province/State",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_state,
      sm: "6",
    },
    {
      type: "label",
      value: "Postal code",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_postalcode,
      sm: "6",
    },
    {
      type: "label",
      value: "Country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.billinginformation &&
        accountDetails.billinginformation[0]?.billing_country,
      sm: "6",
    },
  ];

  const payload4 = [
    {
      type: "label",
      value: "Already in instant cofee business?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.profilesectioninfo &&
          accountDetails.profilesectioninfo[0].instcoffee === true
          ? "Yes"
          : "No",
      sm: "6",
    },
    {
      type: "label",
      value: "Coffee type interested in ?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.coffeetypes
        ?.map((cof) => {
          return cof.coffeetype;
        })
        ?.join(","),
      sm: "6",
    },
  ];

  const payload5 = [
    {
      type: "label",
      value: "Do you have instant coffee manufacturing unit?",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value:
        accountDetails.profilesectioninfo &&
          accountDetails.profilesectioninfo[0].manfacunit === true
          ? "Yes"
          : "No",
      sm: "6",
    },
    {
      type: "label",
      value: "Other information",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.otherinfo,
      sm: "6",
    },
  ];

  const payload6 = [
    {
      type: "label",
      value: "Shipping to continent",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.shippingtocontinent,
      sm: "6",
    },
    {
      type: "label",
      value: "Shipping to country",
      bold: true,
      sm: "6",
    },
    {
      type: "label",
      value: accountDetails.shippingtocountry,
      sm: "6",
    },
  ];


  const payload8 = [
    {
      label: "Select users to assign",
      type: "autocomplete",
      labelprop: "label",
      required: true,
      value: reAssignUser,
      options: usersToReAssign,
      onChange: handleChange7,
    },
  ];
  const handleCheck = (event, key) => {
    let data = {
      ...accountDetails,
      [key]: event.target.checked,
    };
    setAccountDetails(data);
  };

  const payload9 = [
    {
      label: "Eligible for stock price",
      type: "checkbox",
      onChange: (e) => handleCheck(e, "stock"),
      checked: accountDetails?.stock ? accountDetails?.stock : false,
      sm: 12,
    },
  ];

  const reAssign = () => (
    <Container className={classes.modal}>
      <h2 id="simple-modal-title">Select user</h2>
      <h4>Select user to assign:</h4>
      <Grid id="top-row" container>
        <Grid id="top-row" xs={6} md={10} container direction="column">
          <Template payload={payload8}></Template>
        </Grid>
      </Grid>
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button
            label={loading ? "Loading..." : "Proceed"}
            disabled={loading}
            onClick={reAssignAccountToUser}
          />
        </Grid>
        <Grid item>
          <Button label="Cancel" onClick={() => setReAssign(!openReAssign)} />
        </Grid>
      </Grid>
    </Container>
  );

  return <><>
    {showSnack.open && (
      <Snackbar
        {...showSnack}
        handleClose={() =>
          setSnack({ open: false, message: "", severity: "" })
        }
      />
    )}
    <ContentTabs value={tabId} onChange={(tabId) => navigate(`/accounts/${accountId}/view?tab=${tabId}`)}>
      <Tab label="Accounts Information" index="details">
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} style={{ textAlign: 'right' }}>
            <Template payload={payload9} />
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <WhiteTextTypography variant="h3">Account information</WhiteTextTypography>
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload} />
          </Grid>
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload1} />
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid id="top-row" xs={12} md={6} direction="column">
            <Grid item md={12} xs={12} className="item">
              <WhiteTextTypography variant="h3">Shipping address</WhiteTextTypography>
            </Grid>
            <Template payload={payload2} />
          </Grid>
          <Grid id="top-row" xs={12} md={6} direction="column">
            <Grid item md={12} xs={12} className="item">
              <WhiteTextTypography variant="h3">Billing address</WhiteTextTypography>
            </Grid>
            <Template payload={payload3} />
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <WhiteTextTypography variant="h3">Profile completion</WhiteTextTypography>
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload4} />
          </Grid>
          <Grid id="top-row" xs={12} md={6} container direction="column">
            <Template payload={payload5} />
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid item md={12} xs={12} className="item">
            <WhiteTextTypography variant="h3">Shipping information</WhiteTextTypography>
          </Grid>
        </Grid>
        <Grid id="top-row" container>
          <Grid id="top-row" xs={12} md={12} container direction="column">
            <Template payload={payload6} />
          </Grid>
        </Grid>
        <Grid
          container
          xs={12}
          md={12}
          style={{ margin: 24 }}
          justify="center"
        >
          <Grid item>
            <Button
              label="Edit"
              onClick={() => navigate(routeBuilder('accounts', accountId, 'edit'))}
            />
          </Grid>
          <Grid item>
            <Button label="Cancel" onClick={() => navigate('/accounts', { replace: true })} />
          </Grid>
          {userRole === roles.managingDirector ? (
            <Grid item>
              <Button label="Re-Assign" onClick={() => setReAssign(true)} />
            </Grid>
          ) : null}
        </Grid>
        <SimpleModal
          open={openReAssign}
          handleClose={() => setReAssign(!openReAssign)}
          body={reAssign}
        />
      </Tab>
      <Tab label="Contact Information" index="contacts">
        <Grid container direction="row">
          <Grid xs={6} item></Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <Fab
              onClick={() => {
                navigate(`/accounts/${accountId}/contacts/create`)
              }}
              label={"Create Contact"}
              variant="extended"
            />
          </Grid>
        </Grid>
        <AccountContactList
          data={contacts}
          contactDetails={(event, contactId) => navigate(routeBuilder('contacts', contactId, 'view'))}
        />
      </Tab>
      <Tab label="Sample Request Information" index="sample-requests">
        <Grid container direction="row">
          <Grid xs={6} item></Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <Fab
              label={"Request Sample"}
              onClick={() => navigate(`/accounts/${accountId}/sample-request/create`)}
              variant="extended"
            />
          </Grid>
        </Grid>
        <SampleRequestList
          data={samples}
          sampleDetails={(event, sampleId) => navigate(routeBuilder('sample-request', sampleId, 'view'))}
        />
      </Tab>
      <Tab label="Quote Information" index="quotes">
        <Grid container direction="row">
          <Grid xs={6} item></Grid>
          <Grid
            xs={6}
            item
            justify="flex-end"
            alignItems="center"
            style={{ display: "flex" }}
          >
            <Fab
              label={"Create Quote"}
              onClick={() => navigate(`/accounts/${accountId}/quote/create`)}
              variant="extended"
            />
          </Grid>
        </Grid>
        <AccountQuotesList
          data={quotes}
          quoteDetails={(event, quoteNumber, quoteStatus) => navigate(`/quote/${quoteNumber}/view?status=${quoteStatus}`)}
        />
      </Tab>
    </ContentTabs>
  </></>;
};
export default AccountDetails;
