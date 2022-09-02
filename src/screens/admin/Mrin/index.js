import React, { useState, useEffect } from 'react';
import Template from '../../../components/Template';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Container, Grid } from '@material-ui/core';
import Fab from '../../../components/Fab';
import SimpleModal from '../../../components/Modal';
import Button from '../../../components/Button';
import MrinList from './MrinList';
import DispatchList from './DispatchList';
import { getMRINs, getMrinCreationDetail, getPODetails } from "../../../apis";
import useToken from '../../../hooks/useToken';
import { DownloadExcel } from '../../../components/DownloadExcel';
import RoundButton from '../../../components/RoundButton';
import { roles } from '../../../constants/roles'
import _ from 'lodash';
import { colors } from '../../../constants/colors';
import Snackbar from '../../../components/Snackbar';
import { createSearchParams, useNavigate } from 'react-router-dom'
import { routeBuilder } from '../../../utils/routeBuilder';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(3),
        minWidth: '100%'
    },
    formControl: {
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        minWidth: 120,
    },
    control: {
        marginTop: 3,
        marginBottom: 3
    },
    modal: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: 'auto',
        top: "50%",
        right: "50%",
        transform: "translate(50%, -50%)",
        width: 700,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #fefefe',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        overflowY: 'scroll',
        maxHeight: '90vh',
        maxWidth: "90vw",
    },
}));

const formatToSelection = (data = [], val, key) => {
    let formattedData = [];
    data.map(v => formattedData.push({ label: v[val], value: v[key] || v[val] }))
    return formattedData;
};

const Mrin = (props) => {
    const navigate = useNavigate();
    const { getCurrentUserDetails } = useToken();
    const currentUserDetails = getCurrentUserDetails();
    const role = currentUserDetails.role;
    const currentUserId = currentUserDetails.id;

    const [state, setState] = useState(role === roles.managingDirector ? 'allmrins' : 'Pending with QC Approval');
    const [filter, setFilter] = useState(null);
    const classes = useStyles();
    const [mrin, setMrin] = useState(null);
    const [dispatch, setDispatch] = useState([]);
    const [openCreate, setCreate] = useState(false);
    const [showDispatch, setShowDispatch] = useState(false);
    const [poDetails, setPoDetails] = useState({});
    const [showPoDetails, setShowPoDetails] = useState(false);
    const [entity, setEntity] = useState(-1);
    const [pono, setPono] = useState(-1);
    const [createMrinData, setCreateMrinData] = useState([]);
    const [entityList, setEntityList] = useState([]);
    const [poList, setPoList] = useState([]);
    const [showDownloadExcel, setShowDownloadExcel] = useState(false);
    const [showSnack, setSnack] = useState({ open: false, message: '', severity: '' });
    // async function fetchData(status = {}) {
    //     let response = await getMRINs({});
    //     setMrin(response);
    // }
    const getData = async (filter, state) => {
        let filterString = "";
        // if (role !== roles.managingDirector) {
        //     filterString = filterString + `createdbyuserid = '${currentUserId}'`
        // }
        if (state === "Pending with QC Approval" || state === "Pending with Finance" || state === "Closed"  || state === 'Over Due Payments' || state === 'Pending Payments') {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `status = '${state}'`
        }
        if (state === "EOU2" || state === "EOU1" || state === "HEAD OFFICE" || state === 'SEZ') {
            if (!_.isEmpty(filterString))
                filterString = filterString + " AND "
            filterString = filterString + `entityname = '${state}'`
        }
        if (!_.isEmpty(filter)) {
            if (!_.isEmpty(filterString))
                filterString = filterString + ' AND '
            filterString = filterString + `${filter}`
        }
        let data = { filter: filterString, loggedinuserid: currentUserId }
        let response = await getMRINs(data);
        setMrin(response);

        try {
            let response1 = await getMrinCreationDetail({ "type": "allEntities", "loggedinuserid": getCurrentUserDetails()?.id, });
            console.log("Response", response1);
            if (response1) {
                setEntityList(formatToSelection(response1, 'entity_name', 'entity_id'));
                setPoList([]);
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
        getData(filter, state);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, state]);

    const handleChange = async (event) => {
        setState(event.target.value);
        setFilter(null);
    };

    const handleEntityChange = async (e, value) => {
        e.preventDefault();
        setEntity(value);

        setCreateMrinData({ ...createMrinData, 'entityid': value.value });
        let response = await getMrinCreationDetail({ "type": "poidsOnEntityId", "entity_id": value.value });
        if (response && response.length) {
            setPoList(response);
            setPono(-1);
        } else if (response === null) {
            setPoList([]);
            setPono(-1);
            setDispatch([]);
            setShowDispatch(false);
            setPoDetails({});
            setShowPoDetails(false);
        }
    }

    const handlePoChange = async (e, value) => {
        if (value) {
            e.preventDefault();
            setPono(value);
            setCreateMrinData({ ...createMrinData, 'pono': value.po_no, 'poid': value.po_id, 'vendor_id': value.vendor_id, 'subCategory': value.po_sub_category });
            let response = await getMrinCreationDetail({ "type": "dispatchesonpono", "po_no": value.po_no });
            if (response) {
                setDispatch(response);
                setShowDispatch(true);
            } else if (response === null) {
                setDispatch(response);
                setShowDispatch(true);
            }
            let res = await getPODetails({ "po_no": value.po_no });
            if (res) {
                setPoDetails(res);
                setShowPoDetails(true);
            } else if (res === null) {
                setPoDetails(res);
                setShowPoDetails(false);
            }
        } else {
            setEntity(-1);
            setPono(-1);
            setDispatch([]);
            setShowDispatch(false);
            setPoDetails({});
            setShowPoDetails(false);
        }

    }

    const payload = [
        {
            label: 'Delivery at',
            type: 'autocomplete',
            labelprop: "label",
            required: true,
            value: entity,
            options: entityList || [],
            onChange: handleEntityChange,
            sm: 12
        },
        {
            label: 'PO number',
            type: 'autocomplete',
            required: true,
            labelprop: 'po_no',
            value: pono,
            className: classes.control,
            options: poList || [],
            onChange: handlePoChange,
            md: 12,
            sm: 12,
            xs: 12
        },
    ];

    const payload1 = [
        {
            label: 'PO category',
            type: 'input',
            disabled: true,
            value: poDetails.po_category || '',
            className: classes.control,
            sm: 12
        },
        {
            label: 'PO sub category',
            type: 'input',
            disabled: true,
            value: poDetails.po_sub_category || '',
            md: 12,
            sm: 12,
            className: classes.control,
            xs: 12
        },
        {
            label: 'Green coffee type',
            type: 'input',
            disabled: true,
            value: poDetails.item_name || '',
            className: classes.control,
            md: 12,
            sm: 12,
            xs: 12
        },
        {
            label: poDetails?.po_sub_category === "Import" ? 'Purchase Price/MT' : "Purchase Price/KG",
            type: 'input',
            disabled: true,
            value: poDetails?.purchase_price, //poDetails?.po_sub_category === "Import" ? poDetails?.purchase_price : poDetails?.purchasePriceInr,
            className: classes.control,
            md: 12,
            sm: 12,
            xs: 12
        },
    ];


    const onGetCancel = () => {
        setCreate(!openCreate)
        setEntity(-1);
        setPono(-1);
        setDispatch([]);
        setShowDispatch(false);
        setPoDetails({});
        setShowPoDetails(false);
    }

    const createAction = () => (
        <Container className={classes.modal}>
            <div style={{
                width: '100%', height: '100%', overflowY: 'scroll',
            }}>
                <h2 style={{ color: colors.orange, fontWeight: "700", margin: "0 0 1rem 0" }}>
                    Select PO details
                </h2>
                <Grid id="top-row" container>
                    <Grid id="top-row" className='create_mrin' xs={12} container direction="column">
                        <Template payload={payload}></Template>
                        {
                            showPoDetails && <Template payload={payload1}></Template>
                        }
                    </Grid>
                </Grid>
                {showDispatch && <DispatchList data={dispatch} createMrin={(row) => {
                    console.log("MRIN Create");
                    navigate({
                        pathname: '/mrin/create',
                        search: createSearchParams({
                            entityId: entity?.value,
                            pono: pono?.po_no,
                            dispatchNo: row?.dispatchNo
                        })?.toString()
                    })
                }}></DispatchList>
                }
                <Grid id="top-row" container spacing={24} justify="center" alignItems="center">
                    <Grid item>
                        <Button label="Cancel" onClick={() => onGetCancel()} />
                    </Grid>
                </Grid>
            </div>
        </Container>
    );

    const exportExcel = () => {
        setShowDownloadExcel(true);
    }
    return (
        <Container className={classes.root}>
            <>
                {showSnack.open && <Snackbar {...showSnack} handleClose={() => setSnack({ open: false, message: '', severity: '' })} />}
                <Grid container direction="row">
                    <Grid xs={6} item>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel htmlFor="outlined-age-native-simple">View</InputLabel>
                            <Select
                                native
                                value={state}
                                onChange={handleChange}
                                label="View"
                                inputProps={{
                                    name: 'view',
                                    id: 'outlined-view-native-simple',
                                }}
                            >
                                {role === roles.managingDirector ?
                                    <option value="allmrins">All MRINs</option> : null}
                                <option value="Pending with QC Approval">Pending with QC Approval</option>
                                <option value="Pending with Finance">Pending with Finance</option>
                                {/* <option value="approved">Approved MRINs</option> */}
                                <option value="Closed">Closed MRINs</option>
                                <option value="HEAD OFFICE">MRINs at HO</option>
                                <option value="EOU1">MRINs at EOU1 </option>
                                <option value="EOU2">MRINs at EOU2</option>
                                <option value="Over Due Payments">Over Due Payments</option>
                                <option value="Pending Payments">Pending Payments</option>
                                <option value="SEZ">SEZ</option>
                            </Select>
                        </FormControl>
                    </Grid>
                    {
                        currentUserDetails.role !== "QC Manager" &&
                        <Grid xs={6} item justify="flex-end" alignItems="center" style={{ display: 'flex' }}>
                            {mrin !== null &&
                                <RoundButton
                                    onClick={() => exportExcel()}
                                    label='Export to excel'
                                // variant="extended"
                                />
                            }
                            {currentUserDetails.role !== roles?.accountsManager && <Fab onClick={() => setCreate(!openCreate)} label={"Create MRIN"} variant="extended" />}
                        </Grid>
                    }
                </Grid>
                {showDownloadExcel === true &&
                    <DownloadExcel tableData={mrin} tableName='MRIN' />
                }
                <MrinList selectedAdvancedFilters={(value) => { setFilter(value) }}
                    clearAdvancedFilters={() => setFilter(null)}
                    data={mrin} viewPo={(event, poid) => navigate(routeBuilder('purchase-order', poid, 'view'))} mrinDetails={(event, mrinId, entityId) => navigate(`/mrin/${mrinId}/view?entityId=${entityId}`)} />
            </>
            <SimpleModal open={openCreate} handleClose={() => setCreate(!openCreate)} body={createAction} xx />
        </Container>
    )
}

export default Mrin;