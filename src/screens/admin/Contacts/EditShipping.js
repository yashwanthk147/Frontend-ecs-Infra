import React, { useState, useEffect } from "react";
import Template from "../../../components/Template";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import _ from "lodash";
import {
  createAccountContact,
  getCityNames,
  getCountryNames,
  getshippingaddress,
  getStateNames,
} from "../../../apis";
import Button from "../../../components/Button";
import Snackbar from "../../../components/Snackbar";
import "../../common.css";
import useToken from "../../../hooks/useToken";
import { useNavigate, useParams } from "react-router-dom";
const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      marginTop: 10,
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
}));

const formatToSelection = (data = [], key) => {
  let formattedData = [];
  data.map((v) => formattedData.push({ label: v[key], value: v.id || v[key] }));
  return formattedData;
};

const EditShipping = (props) => {
  const classes = useStyles();
  const [shipping, setShippingInfo] = useState({});
  const [showShipping, setShowShipping] = useState({});
  const [shippingCity, setShippingCity] = useState([]);
  const [shippingState, setShippingState] = useState([]);
  // eslint-disable-next-line
  const [validationError, setValidationError] = useState({});
  const [showSnack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [loading, setLoading] = useState(false);
  const { getCurrentUserDetails } = useToken();
  const { shippingId, accountId, contactId } = useParams();
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   getCountryName();
  //   // eslint-disable-next-line
  // }, []);

  useEffect(() => {
    getCountryName();

    getshippingaddress({
      shipping_id: shippingId.toString()
    }).then((res1) => {
      var res = {
        shipping_id: res1[0]?.shipping_id,
        shipping_city: res1[0]?.shipping_city,
        shipping_country: {label: res1[0]?.shipping_country, value: res1[0]?.shipping_country},
        shipping_postalcode: res1[0]?.shipping_postalcode,
        shipping_state: res1[0]?.shipping_state,
        shipping_street: res1[0]?.shipping_street,
        shipping_primary: res1[0]?.shipping_primary
      };
      setShippingInfo(res);
      let temp = {};
      getCountryNames().then((country) => {
        let countries = formatToSelection(country, "country");
        temp.country = countries;
        if (res.shipping_country !== "") {
          getStateNames({ countryname: res.shipping_country?.value })
            .then((states) => {
              temp.state = formatToSelection(states, "state");
              setShippingState({label: res.shipping_state, value: res.shipping_state});
              if (res.shipping_state !== "") {
                getCityNames({ statename: res.shipping_state })
                  .then((cities) => {
                    temp.city = formatToSelection(cities, "city");
                    setShippingCity({label: res.shipping_city, value: res.shipping_city});
                  })
                  .catch((err) => console.log("Get city error", err.message));
              }
            })
            .catch((err) => console.log("Get state error", err.message));
        }
        setShowShipping(temp);
      });
    });
    // eslint-disable-next-line
  }, []);

  const getCountryName = () => {
    getCountryNames().then((res) => {
      let countries = formatToSelection(res, "country");
      setShowShipping({ ...showShipping, country: countries });
    });
  };

  const handleChange = (e, key) => {
    e.preventDefault();
    const value = e.target.value;
    setShippingInfo({
      ...shipping,
      [key]: value,
    });
  };

  const handleCityChange = (e, value) => {
    setShippingCity(value);
    setShippingInfo({
   ...shipping,
   'shipping_city': value.value,
 });
}

  const handleStateChange = (e, value) => {
       setShippingInfo({
      ...shipping,
      'shipping_state': value.value,
    });
    setShippingState(value);
    getCityNames({ statename: value.value })
    .then((res) =>
      setShowShipping({
        ...showShipping,
        city: formatToSelection(res, "city"),
      })
    )
    .catch((err) => console.log("Get state error", err.message));
  }  

  const handleCountryChange = (e, value) => {
       setShippingInfo({
      ...shipping,
      'shipping_country': value,
    });
    getStateNames({ countryname: value.value })
        .then((res) =>
          setShowShipping({
            ...showShipping,
            state: formatToSelection(res, "state"),
          })
        )
        .catch((err) => console.log("Get state error", err.message));
  }

  const payload = [
    {
      label: "Street name",
      type: "input",
      required: true,
      value: shipping.shipping_street ? shipping.shipping_street : "",
      error: validationError?.shipping_street,
      helperText: validationError?.shipping_street,
      onChange: (e) => handleChange(e, "shipping_street"),
    },
    {
      label: "Country",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_country,
      helperText: validationError?.shipping_country,
      value: shipping.shipping_country ? shipping.shipping_country : "",
      options: showShipping.country ? showShipping.country : [],
      onChange: handleCountryChange,
    },
    {
      label: "Province/State",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_state,
      helperText: validationError?.shipping_state,
      value: shippingState,
      options: showShipping.state || [],
      onChange: handleStateChange,
    },
    {
      label: "City",
      type: 'autocomplete', 
      labelprop: "label",
      required: true,
      error: validationError?.shipping_city,
      helperText: validationError?.shipping_city,
      value: shippingCity,
      options: showShipping.city || [],
      onChange: handleCityChange,
    },
    {
      label: "Postal code",
      type: "input",
      inputProps: { maxLength: 6 },
      value: shipping.shipping_postalcode ? shipping.shipping_postalcode : "",
      onChange: (e) => handleChange(e, "shipping_postalcode"),
    },
    {
      label: "Is Primary Shipping Address",
      type: "checkbox",
      onChange: (e) => handleCheck(e, "shipping_primary"),
      checked: shipping.shipping_primary ? shipping.shipping_primary : false,
  },
  ];

  const handleCheck = (event, key) => {
    let data = {
      ...shipping,
      [key]: event.target.checked,
    };
    setShippingInfo(data);
  };

  const submitContact = async () => {
    let error = {};
    let errormsg = "Please fill the field value.";
    if (_.isEmpty(shippingCity)) {
      error = { ...error, shipping_city: errormsg };
    } 
    if(_.isEmpty(shipping.shipping_country)) {
      error = { ...error, shipping_country: errormsg };
    } 
    if(_.isEmpty(shipping.shipping_street)) {
      error = { ...error, shipping_street: errormsg };
    } 
    if(_.isEmpty(shippingState)) {
      error = { ...error, shipping_state: errormsg };
    }

    if (!_.isEmpty(error)) {
      setValidationError(error);
    } else {
      let data = {
        contactshipping_update: true,
        contactid: contactId.toString(),
        accountid: accountId.toString(),
        "loggedinuserid": getCurrentUserDetails()?.id,
        shippinginfo: [
          {
            shipping_id: shippingId,
            shipping_city: shippingCity?.value,
            shipping_country: shipping.shipping_country?.value,
            shipping_postalcode: shipping.shipping_postalcode,
            shipping_state: shippingState?.value,
            shipping_street: shipping.shipping_street,
            shipping_primary: shipping.shipping_primary
          },
        ],
      };
      setLoading(true);
      try {
        let response = await createAccountContact(data);
        console.log("Response", response);
        if (response) {
          setSnack({
            open: true,
            message: "Contact updated successfully",
          });
          setTimeout(() => {
            navigate(`/contacts/${contactId}/view`)
          }, 2000);
        }
      } catch (e) {
        setSnack({
          open: true,
          message: 'Server Error. Please contact administrator', //e.response?.data
          severity: "error",
        });
      }
      finally{
        setLoading(false);
      }
    }
  };

  return (
    <form className={classes.root} noValidate autoComplete="off">
      {showSnack.open && (
        <Snackbar
          {...showSnack}
          handleClose={() =>
            setSnack({ open: false, message: "", severity: "" })
          }
        />
      )}
      <Grid id="top-row" container>
        <Grid item md={12} xs={12} className="item">
          <Typography>Shipping details</Typography>
        </Grid>
      </Grid>
      <Template payload={payload} />
      <Grid
        id="top-row"
        container
        spacing={24}
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Button label="Back" onClick={() => navigate(`/contacts/${contactId}/view`)} />
        </Grid>
        <Grid item>
          <Button disabled={loading} label={loading ? "Loading..." : "Save"} onClick={submitContact} />
        </Grid>
      </Grid>
    </form>
  );
};

export default EditShipping;
