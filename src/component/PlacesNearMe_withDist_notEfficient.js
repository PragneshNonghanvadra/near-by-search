import React, { Component } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import Script from "react-load-script";
// import locationImage from "../images/Location.png";

const API_KEY = "AIzaSyDuLv4aZRFP5S-wsuKbSpsuszzmdoTUmHo";

class PlacesNearMe extends Component {
  constructor() {
    super();
    this.state = {
      query: "",
      place: "",
      nearPlaces: [],
      nearPlaces1: [],
      nextPageToken1: "",
      nearPlaces2: [],
      nextPageToken2: "",
      placeLocation: {
        lat: "",
        lng: ""
      },
      detailedPlaces: [],
      currentPlaceDetail: null,
      currentLocation: {
        lat: "",
        lng: ""
      },
      flag: "",
      category: "",
      currentPage: 1,
      city: "",
      loading: true,
      locationErr: "",
      locOrCategoryChanged: true,
      isPageShowable: false
    };
  }

  getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      window.navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  getCurrentLocation = async () => {
    this.setState({
      nearPlaces1: [],
      nearPlaces2: [],
      currentPage: 1,
      loading: true,
      category: ""
    });
    // console.log("current Location");
    var currentLocation = {};
    const location = window.navigator && window.navigator.geolocation;
    if (location) {
      //   const obj = await this.getCurrentPosition();
      //   Object.assign(currentLocation, {
      //     lat: obj.coords.latitude,
      //     lng: obj.coords.longitude
      //   });
      //   console.log("Location", obj);
      //   this.setState({ currentLocation });
      // }
      // this.handleRequestByLocation(currentLocation);
      // return currentLocation;
      this.getCurrentPosition()
        .then(pos => {
          Object.assign(currentLocation, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          // console.log(currentLocation);
          this.setState({ currentLocation });
          this.handleRequestByLocation(currentLocation);
        })
        .catch(err => {
          console.log("Error", err.message);
          switch (err.code) {
            case 1:
              this.setState({
                locationErr:
                  "You've decided not to share your position, but it's OK. We won't ask you again.",
                loading: false
              });
              alert(
                "You've decided not to share your position, but it's OK. \n We won't ask you again."
              );
              break;
            case 2:
              this.setState({
                locationErr:
                  "The network is down or the positioning service can't be reached.",
                loading: false
              });
              alert(
                "The network is down or the positioning service can't be reached."
              );
              break;
            case 3:
              this.setState({
                locationErr:
                  "The attempt timed out before it could get the location data.",
                loading: false
              });
              alert(
                "The attempt timed out before it could get the location data."
              );
              break;
            default:
              this.setState({
                locationErr: "Geolocation failed due to unknown error.",
                loading: false
              });
              alert("Geolocation failed due to unknown error.");
          }
        });
    }
  };

  componentWillMount = () => {
    console.log("ComponenWillMount Called");
    this.getCurrentLocation();
  };

  handleRequestByLocation = async currentLocation => {
    console.log("handleRequestByLocation Called");
    console.log(currentLocation);
    const res = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?latlng=${
        currentLocation.lat
      },${currentLocation.lng}&key=${API_KEY}`
    );
    if (res.data.results.length > 0)
      this.setState({
        query: res.data.results[0].formatted_address,
        currentLocation: currentLocation,
        loading: true,
        isPageShowable: false
      });
    const nearPlaces = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        currentLocation.lat
      },${currentLocation.lng}&rankby=distance&key=${API_KEY}`
    );
    if (nearPlaces.data && nearPlaces.data.results)
      this.setState({
        nearPlaces: nearPlaces.data.results,
        nextPageToken1: nearPlaces.data.next_page_token,
        flag: "with location",
        loading: false,
        isPageShowable: false
      });
    console.log("initial", nearPlaces);
    console.log(res);
  };

  handleRequestByName = async e => {
    if (e) e.preventDefault();
    this.setState({
      nearPlaces1: [],
      nearPlaces2: [],
      currentPage: 1,
      loading: true,
      category: "",
      nextPageToken1: "",
      nextPageToken2: "",
      flag: "",
      isPageShowable: false
    });
    const query = encodeURIComponent(this.state.query);
    console.log(query);
    // this.setState({ query });
    const res1 = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry,icon&key=${API_KEY}`
    );
    const res2 = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`
    );
    var res = res1.data;
    if (res1.data.candidates && res2.data.results) {
      if (res1.data.candidates.length < res2.data.results.length) {
        res = res2.data;
        if (res.next_page_token)
          this.setState({
            nextPageToken1: res.next_page_token,
            flag: "without location",
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        this.setState({ nearPlaces: res.results, loading: false });
      } else {
        if (res.next_page_token)
          this.setState({
            nextPageToken1: res.next_page_token,
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        this.setState({
          nearPlaces: res.candidates,
          loading: false,
          locOrCategoryChanged: true,
          isPageShowable: false
        });
      }
      console.log("res ", res);
    }
    // console.log("res1 ", res1.data);
    // console.log("res2 ", res2.data);
    // console.log("Token", res.next_page_token);

    if (
      res.candidates &&
      res.candidates.length < 2 &&
      res.candidates.length > 0
    ) {
      const nearPlaces = await axios.get(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
          res.candidates[0].geometry.location.lat
        },${
          res.candidates[0].geometry.location.lng
        }&rankby=distance&key=${API_KEY}`
      );
      if (res.candidates.length < nearPlaces.data.results.length) {
        if (nearPlaces.data.next_page_token)
          this.setState({
            nextPageToken1: nearPlaces.data.next_page_token,
            flag: "with location",
            currentLocation: {
              lat: res.candidates[0].geometry.location.lat,
              lng: res.candidates[0].geometry.location.lng
            },
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        this.setState({
          nearPlaces: nearPlaces.data.results,
          loading: false,
          locOrCategoryChanged: true,
          isPageShowable: false
        });
      }
      console.log("Token", nearPlaces.data.next_page_token);
      // console.log(nearPlaces.data.results);
      if (nearPlaces.data.results.length === 0) console.log("No Near Places");
      // else {
      //   console.log(nearPlaces.data.results[0].photos[0].photo_reference);
      // }
    }
  };

  handleNextPage = async page => {
    const { lat, lng } = this.state.currentLocation;
    var nextPageToken = this.state.nextPageToken1;
    if (page === 3) {
      nextPageToken = this.state.nextPageToken2;
    }
    console.log("nextPageToken", nextPageToken);
    this.setState({
      currentPage: page,
      locOrCategoryChanged: false
    });
    console.log(page);
    if (
      (page === 2 && this.state.nearPlaces1.length === 0) ||
      (page === 3 && this.state.nearPlaces2.length === 0)
    ) {
      this.setState({ loading: true });
      if (this.state.flag === "with location") {
        const nearPlaces = await axios.get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=*&pagetoken=${nextPageToken}&key=${API_KEY}`
        );
        if (page === 2)
          this.setState({
            nearPlaces1: nearPlaces.data.results,
            nextPageToken2: nearPlaces.data.next_page_token,
            loading: false,
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        else if (page === 3)
          this.setState({
            nearPlaces2: nearPlaces.data.results,
            loading: false,
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        console.log(nearPlaces);
      } else if (this.state.flag === "without location") {
        const nearPlaces = await axios.get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/textsearch/json?query=${
            this.state.query
          }&pagetoken=${nextPageToken}&key=${API_KEY}`
        );
        if (page === 2)
          this.setState({
            nearPlaces1: nearPlaces.data.results,
            nextPageToken2: nearPlaces.data.next_page_token,
            loading: false,
            locOrCategoryChanged: true,
            isPageShowable: false
          });
        else if (page === 3)
          this.setState({
            nearPlaces2: nearPlaces.data.results,
            loading: false,
            locOrCategoryChanged: true,
            isPageShowable: false
          });
      }
    }
  };

  handleRequestByCategory = async e => {
    e.preventDefault();
    this.setState({
      nearPlaces: [],
      nearPlaces1: [],
      nearPlaces2: [],
      currentPage: 1,
      loading: true,
      isPageShowable: false
    });
    const currentLocation = this.state.currentLocation;
    const category = encodeURIComponent(this.state.category);
    console.log(category);
    const res = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        currentLocation.lat
      },${currentLocation.lng}&radius=50000&type=${category}&key=${API_KEY}`
    );
    console.log(res);
    this.setState({
      nearPlaces: res.data.results,
      nextPageToken1: res.data.next_page_token,
      loading: false,
      locOrCategoryChanged: true
    });
  };

  getDetailedPlace = place => {
    console.log(place.place_id);
    axios
      .get(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?placeid=${
          place.place_id
        }&fields=name,rating,formatted_phone_number,photo,formatted_address,international_phone_number,reviews,types,url,vicinity,website&key=${API_KEY}`
      )
      .then(res => {
        console.log(res);
        return this.setState({
          currentPlaceDetail: res,
          loading: false,
          locOrCategoryChanged: false
        });
      })
      .catch(err => console.log("Error in Finding Place Detail"));
  };

  handleScriptLoad = () => {
    // Declare Options For Autocomplete
    var options = {
      types: ["address"]
    }; // To disable any eslint 'google not defined' errors

    // Initialize Google Autocomplete
    /*global google*/

    this.autocomplete = new google.maps.places.Autocomplete(
      document.getElementById("autocomplete"),
      options
    );

    // Fire Event when a suggested name is selected
    this.autocomplete.addListener("place_changed", this.handlePlaceSelect);
  };

  handlePlaceSelect = () => {
    // Extract City From Address Object
    let addressObject = this.autocomplete.getPlace();
    let address = addressObject.address_components;

    // Check if address is valid
    if (address) {
      console.log(address);
      this.setState({
        city: address[0].long_name,
        query: addressObject.formatted_address
      });
      axios
        .get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            addressObject.formatted_address
          )}&key=${API_KEY}`
        )
        .then(res =>
          this.setState({
            currentLocation: {
              lat: res.data.results[0].geometry.location.lat,
              lng: res.data.results[0].geometry.location.lng,
              locOrCategoryChanged: false
            }
          })
        );
    }
  };

  render() {
    if (this.state.currentPage === 1 && this.state.locOrCategoryChanged) {
      this.nearPlaces = this.state.nearPlaces.map(async (place, i) => {
        const dist = await axios.get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
            this.state.currentLocation.lat
          },${this.state.currentLocation.lng}&destinations=${
            place.geometry.location.lat
          },${place.geometry.location.lng}&key=${API_KEY}`
        );

        // console.log("dist", dist);

        return (
          <div
            key={i}
            onClick={() => this.getDetailedPlace(place)}
            data-toggle="modal"
            data-target="#exampleModalCenter"
            className="place"
          >
            <div style={{ marginTop: "-3rem", marginBottom: "1rem" }}>
              <img src={place.icon} alt={"No icon Available"} />
            </div>
            <div>
              <span>{place.name}</span>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <span>
                <i className="fa fa-map-marker fa-1x icon" aria-hidden="true" />{" "}
                {dist.data.rows[0].elements[0].distance.text}
              </span>
            </div>
          </div>
        );
      });
      if (this.nearPlaces.length > 0) {
        Promise.all(this.nearPlaces).then(values => {
          this.nearPlaces = values;
          this.setState({ isPageShowable: true, locOrCategoryChanged: false });
          console.log("values", values);

          console.log("this.nearPlace", this.nearPlaces);
        });
      }
      console.log("this.nearPlace", this.nearPlaces, this.state.isPageShowable);
    }
    if (this.state.currentPage === 2 && this.state.locOrCategoryChanged) {
      this.nearPlaces1 = this.state.nearPlaces1.map(async (place, i) => {
        const dist = await axios.get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
            this.state.currentLocation.lat
          },${this.state.currentLocation.lng}&destinations=${
            place.geometry.location.lat
          },${place.geometry.location.lng}&key=${API_KEY}`
        );

        return (
          <div
            key={i}
            onClick={() => this.getDetailedPlace(place)}
            data-toggle="modal"
            data-target="#exampleModalCenter"
            className="place"
          >
            <div style={{ marginTop: "-3rem", marginBottom: "1rem" }}>
              <img src={place.icon} alt={"No icon Available"} />
            </div>
            <div>
              <span>{place.name}</span>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <span>
                <i className="fa fa-map-marker fa-1x icon" aria-hidden="true" />{" "}
                {dist.data.rows[0].elements[0].distance.text}
              </span>
            </div>
          </div>
        );
      });
      if (this.nearPlaces1.length > 0) {
        Promise.all(this.nearPlaces1).then(values => {
          this.nearPlaces1 = values;
          this.setState({ isPageShowable: true, locOrCategoryChanged: false });
          // console.log("values", values);

          // console.log("this.nearPlace", this.nearPlaces);
        });
      }
      // console.log("nearPlace1", this.nearPlaces1);
    }
    if (this.state.currentPage === 3 && this.state.locOrCategoryChanged) {
      this.nearPlaces2 = this.state.nearPlaces2.map(async (place, i) => {
        const dist = await axios.get(
          `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
            this.state.currentLocation.lat
          },${this.state.currentLocation.lng}&destinations=${
            place.geometry.location.lat
          },${place.geometry.location.lng}&key=${API_KEY}`
        );

        return (
          <div
            key={i}
            onClick={() => this.getDetailedPlace(place)}
            data-toggle="modal"
            data-target="#exampleModalCenter"
            className="place"
          >
            <div style={{ marginTop: "-3rem", marginBottom: "1rem" }}>
              <img src={place.icon} alt={"No icon Available"} />
            </div>
            <div>
              <span>{place.name}</span>
            </div>
            <div style={{ marginTop: "1.5rem" }}>
              <span>
                <i className="fa fa-map-marker fa-1x icon" aria-hidden="true" />{" "}
                {dist.data.rows[0].elements[0].distance.text}
              </span>
            </div>
          </div>
        );
      });
      if (this.nearPlaces2.length > 0) {
        Promise.all(this.nearPlaces2).then(values => {
          this.nearPlaces2 = values;
          this.setState({ isPageShowable: true, locOrCategoryChanged: false });
          // console.log("values", values);

          // console.log("this.nearPlace", this.nearPlaces);
        });
      }
    }
    return (
      <div>
        <h3
          style={{ textAlign: "center", fontSize: "3.5rem", marginTop: "1rem" }}
        >
          NearBy Search
        </h3>
        <Script
          url={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`}
          onLoad={this.handleScriptLoad}
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <abbr title="Set Current Location">
            <button
              style={{
                margin: "2rem",
                marginRight: "-2rem",
                marginTop: "2rem"
              }}
              className="btn btn-primary"
              onClick={this.getCurrentLocation}
            >
              {/* <img
                src={locationImage}
                height="26rem"
                width="26rem"
                alt={"Current Location"}
                style={{
                  margin: "2rem",
                  marginLeft: "-2rem",
                  marginTop: "2.4rem"
                }}
                className="location-img"
              /> */}
              <i className="fa fa-map-marker fa-1x icon" aria-hidden="true" />
            </button>
          </abbr>
          <input
            type="text"
            id="autocomplete"
            className="form-control"
            onChange={e => this.setState({ query: e.target.value })}
            placeholder="Search Places.."
            style={{ width: "50rem", margin: "2rem" }}
            value={this.state.query}
            onFocus={e => e.target.select()}
          />

          <button
            className="btn btn-primary"
            style={{
              margin: "2rem",
              marginLeft: "-2rem"
            }}
            onClick={this.handleRequestByName}
            disabled={this.state.query.length === 0}
          >
            <i className="fa fa-location-arrow fa-1x" aria-hidden="true" />
          </button>
        </div>
        <form
          onSubmit={this.handleRequestByCategory}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <input
            type="text"
            className="form-control"
            onChange={e => this.setState({ category: e.target.value })}
            placeholder="Search category..(eg: Food, Restaurant)"
            style={{ width: "50rem", margin: "2rem" }}
            onFocus={e => e.target.select()}
            value={this.state.category}
          />
          <button
            className="btn btn-primary"
            style={{ margin: "2rem", marginLeft: "-2rem" }}
            disabled={this.state.category.length === 0}
          >
            {" "}
            <i className="fa fa-search" />{" "}
          </button>
        </form>
        {this.state.nearPlaces.length !== 0 && this.state.isPageShowable ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              backgroundColor: "rgb(2, 47, 119)",
              marginLeft: "2.5rem",
              marginRight: "2.5rem",
              borderRadius: "10px",
              marginBottom: "3.5rem",
              marginTop: "4rem"
            }}
          >
            {/* <button
              className="btn btn-light"
              onClick={() =>
                this.setState({ currentPage: 1, locOrCategoryChanged: false })
              }
            >
              1
            </button>
            <button
              className="btn btn-light"
              onClick={() => this.handleNextPage(2)}
            >
              2
            </button>
            <button
              className="btn btn-light"
              onClick={() => this.handleNextPage(3)}
            >
              3
            </button> */}
            <button
              className="btn btn-light"
              onClick={() => {
                if (this.state.currentPage > 1)
                  this.handleNextPage(this.state.currentPage - 1);
              }}
              style={{ marginRight: "5rem" }}
              disabled={this.state.currentPage === 1}
            >
              Prev
            </button>
            <button
              className="btn btn-light"
              onClick={() => {
                if (this.state.currentPage < 3)
                  this.handleNextPage(this.state.currentPage + 1);
              }}
              style={{ marginLeft: "5rem" }}
              disabled={this.state.currentPage === 3}
            >
              Next
            </button>
          </div>
        ) : (
          <div> </div>
        )}
        {this.state.currentPage === 1 && this.state.isPageShowable ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            {!this.state.loading && this.state.isPageShowable ? (
              this.nearPlaces
            ) : (
              <div
                className="spinner-border text-primary"
                style={{ marginTop: "9rem", height: "9rem", width: "9rem" }}
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </div>
        ) : this.state.currentPage === 2 && this.state.isPageShowable ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            {/* {this.state.currentPage} */}
            {/* {nearPlaces1.length === 0 ? (
              <div> 0 </div>
            ) : (
              <div>greater than 0</div>
            )} */}
            {!this.state.loading && this.state.isPageShowable ? (
              this.nearPlaces1
            ) : (
              <div
                className="spinner-border text-primary"
                style={{ marginTop: "9rem", height: "9rem", width: "9rem" }}
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap"
            }}
          >
            {/* {this.state.currentPage} */}
            {/* {nearPlaces2.length === 0 ? (
              <div> 0 </div>
            ) : (
              <div>greater than 0</div>
            )} */}
            {!this.state.loading && this.state.isPageShowable ? (
              this.nearPlaces2
            ) : (
              <div
                className="spinner-border text-primary"
                style={{ marginTop: "9rem", height: "9rem", width: "9rem" }}
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
            )}
          </div>
        )}

        <div
          className="modal fade"
          id="exampleModalCenter"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalCenterTitle"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLongTitle">
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result ? (
                    <span style={{ fontWeight: "bold" }}>
                      {this.state.currentPlaceDetail.data.result.name}
                    </span>
                  ) : (
                    <span />
                  )}
                </h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result
                    .formatted_phone_number ? (
                    <span>
                      <span style={{ fontWeight: "bold" }}>
                        Phone No:&nbsp;
                      </span>
                      {
                        this.state.currentPlaceDetail.data.result
                          .formatted_phone_number
                      }
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result
                    .international_phone_number ? (
                    <span>
                      <span style={{ fontWeight: "bold" }}>
                        International Phone No:&nbsp;
                      </span>
                      {
                        this.state.currentPlaceDetail.data.result
                          .international_phone_number
                      }
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result.rating ? (
                    <span>
                      <span style={{ fontWeight: "bold" }}>Rating:&nbsp;</span>
                      {this.state.currentPlaceDetail.data.result.rating}
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result
                    .formatted_address ? (
                    <span>
                      <span style={{ fontWeight: "bold" }}>Address:&nbsp;</span>
                      {
                        this.state.currentPlaceDetail.data.result
                          .formatted_address
                      }
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result.url ? (
                    <div>
                      <span style={{ fontWeight: "bold" }}>
                        {" "}
                        Google Map:&nbsp;{" "}
                      </span>
                      <a
                        href={this.state.currentPlaceDetail.data.result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Go To Google Map
                      </a>
                    </div>
                  ) : (
                    <span />
                  )}
                </div>
                <div>
                  {" "}
                  {this.state.currentPlaceDetail !== null &&
                  this.state.currentPlaceDetail.data.result &&
                  this.state.currentPlaceDetail.data.result.website ? (
                    <span>
                      <span style={{ fontWeight: "bold" }}>
                        {" "}
                        Go to Website{" "}
                      </span>
                      <a
                        href={this.state.currentPlaceDetail.data.result.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {this.state.currentPlaceDetail.data.result.website}
                      </a>
                    </span>
                  ) : (
                    <span />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PlacesNearMe;
