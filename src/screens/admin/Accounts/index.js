import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid } from '@material-ui/core';
import AccountList from './AccountList';
import { getAccounts } from '../../../apis';
import useToken from '../../../hooks/useToken';
import RoundButton from '../../../components/RoundButton';
import { DownloadExcel } from '../../../components/DownloadExcel';
import _ from 'lodash';
import { roles } from '../../../constants/roles';
import Snackbar from '../../../components/Snackbar';
import { useNavigate } from 'react-router-dom';
const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    minWidth: "100%",
  },
  formControl: {
    margin: theme.spacing(1),
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
}));

const Accounts = () => {
  const { getCurrentUserDetails } = useToken();
  const navigate = useNavigate();
  const currentUserDetails = getCurrentUserDetails();
  const userRole = currentUserDetails?.role;
  const userId = currentUserDetails?.id;
  const userName = currentUserDetails?.name;
  const [state, setState] = React.useState(
    userRole === roles.managingDirector ? "all" : "myaccounts"
  );
  const classes = useStyles();
  const [accounts, setAccounts] = useState(null);
  const [filter, setFilter] = useState("");
  const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
  const [showDownloadExcel, setShowDownloadExcel] = useState(false);

  const fetchData = async (filter, state) => {
    let filterString = "";
    if (userRole === roles.marketingExecutive) {
      filterString = filterString + `account_owner = '${userName}'`;
    } else {
      if (userRole !== roles.managingDirector || state === "myaccounts") {
        filterString = filterString + `createdbyuserid = '${userId}'`;
      }
    }
    if (state !== "all" && state !== "myaccounts") {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + ` masterstatus = '${state}'`;
    }
    if (!_.isEmpty(filter)) {
      if (!_.isEmpty(filterString)) filterString = filterString + " AND ";
      filterString = filterString + `${filter}`;
    }
    let data = { filter: filterString, loggedinuserid: userId };
    try {
      let response = await getAccounts(data);
      console.log("Response", response);
      if (response) {
        setAccounts(response);
      }
    } catch (e) {
      setSnack({
        open: true,
        message: 'Server Error. Please contact administrator', //e.response?.data
        severity: 'error',
      })
    }



  };
  useEffect(() => {
    fetchData(filter, state);
    // eslint-disable-next-line
  }, [filter, state]);

  const exportExcel = () => {
    setShowDownloadExcel(true);
  };

  return <Container className={classes.root}>
    <>
      {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
      <Grid container direction="row">
        <Grid xs={6} item>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
            <Select
              native
              value={state}
              onChange={(event) => {
                setState(event.target.value);
                setFilter(null);
              }}
              label="View"
              inputProps={{
                name: "view",
                id: "outlined-view-native-simple",
              }}
            >
              {userRole === roles.managingDirector ? (
                <option aria-label="None" value="all">
                  All Accounts
                </option>
              ) : null}
              <option value="myaccounts">My Accounts</option>
              <option value="Pending Approval">Pending Approval</option>
            </Select>
          </FormControl>
        </Grid>

        <Grid
          xs={6}
          item
          justify="flex-end"
          alignItems="center"
          style={{ display: "flex" }}
        >
          {accounts !== null && (
            <RoundButton
              onClick={() => exportExcel()}
              label="Export to excel"
            />
          )}
        </Grid>
      </Grid>

      {showDownloadExcel === true && (
        <DownloadExcel tableData={accounts} tableName="Accounts" />
      )}

      <AccountList
        selectedAdvancedFilters={(val) => setFilter(val)}
        clearAdvancedFilters={() => setFilter("")}
        data={accounts}
        accountDetails={(event, accountId) => { navigate(`/accounts/${accountId}/view?tab=details`) }}
      />
    </>
  </Container>;
};

export default Accounts;