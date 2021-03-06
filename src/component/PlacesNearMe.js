import React, { Component } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.css";
import "../App.css";
import Script from "react-load-script";
import StarRatings from "react-star-ratings";

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
      isPageShowable: false,
      currentPlaceloading: false,
      filterApplied: false,
      sortingApplied: false,
      sortValue: "--------"
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
      category: "",
      sortingApplied: false
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
        isPageShowable: false,
        locOrCategoryChanged: true,
        currentPage: 1,
        nearPlaces: [],
        nearPlaces1: [],
        nearPlaces2: [],
        filterApplied: false,
        sortingApplied: false,
        filterValue: "All",
        sortValue: "--------"
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
      isPageShowable: false,
      filterApplied: false,
      sortingApplied: false,
      sortValue: "--------",
      filterValue: "All"
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
      locOrCategoryChanged: false,
      filterApplied: false,
      sortingApplied: false,
      sortValue: "--------",
      filterValue: "All"
    });
    console.log(page);
    if (
      (page === 2 &&
        this.state.nearPlaces1.length === 0 &&
        this.state.nearPlaces.length === 20) ||
      (page === 3 &&
        this.state.nearPlaces2.length === 0 &&
        this.state.nearPlaces1.length === 20)
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
      isPageShowable: false,
      filterApplied: false,
      sortingApplied: false,
      sortValue: "--------",
      filterValue: "All"
    });
    const currentLocation = this.state.currentLocation;
    const category = this.state.category
      .split(" ")
      .join("_")
      .toLocaleLowerCase();
    const keyword = encodeURIComponent(this.state.category.toLocaleLowerCase());
    console.log(category);
    const res = await axios.get(
      `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${
        currentLocation.lat
      },${
        currentLocation.lng
      }&radius=50000&type=${category}&keyword=${keyword}&key=${API_KEY}`
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
    this.setState({ currentPlaceloading: true });
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
          locOrCategoryChanged: false,
          currentPlaceloading: false
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

  getPlacesComponents = async (nearPlaces, flag) => {
    console.log("call to getPlacesComponents", nearPlaces);
    // this.setState({ isPageShowable: false });
    if (flag === "initial") {
      const locArray = await nearPlaces.map(place => {
        return `${place.geometry.location.lat}%2C${
          place.geometry.location.lng
        }`;
      });
      console.log("locArray", locArray);
      const res = await axios.get(
        `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
          this.state.currentLocation.lat
        }%2C${this.state.currentLocation.lng}&destinations=${locArray.join(
          "%7C"
        )}&key=${API_KEY}`
      );
      var distArray;
      if (res.data && res.data.rows[0] && res.data.rows[0].elements) {
        distArray = await res.data.rows[0].elements.map(data => {
          if (data.distance && data.distance.text) return data.distance.text;
          else return "Not Available";
        });
      }
      var types = [];
      var answer = await nearPlaces.map((place, i) => {
        // const dist = await axios.get(
        //   `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?origins=${
        //     this.state.currentLocation.lat
        //   },${this.state.currentLocation.lng}&destinations=${
        //     place.geometry.location.lat
        //   },${place.geometry.location.lng}&key=${API_KEY}`
        // );

        // console.log("dist", dist);
        types = types.concat(place.types);

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
            <div style={{ marginTop: "1rem" }}>
              <span>
                <i className="fa fa-map-marker fa-1x icon" aria-hidden="true" />{" "}
                {/* {dist.data.rows[0].elements[0].distance.text} */}
                {distArray[i]}
              </span>
            </div>
            <div style={{ marginTop: "0.4rem" }}>
              <span>
                {typeof place.rating !== "undefined" ? (
                  <span>
                    <b>{place.rating}</b>
                    {" : "}
                    <StarRatings
                      rating={place.rating}
                      starRatedColor="gold"
                      numberOfStars={5}
                      name="rating"
                      starDimension="1.5rem"
                      starSpacing="0.1rem"
                    />{" "}
                  </span>
                ) : (
                  <span>
                    <b>0</b>
                    {" : "}
                    <StarRatings
                      rating={0}
                      starRatedColor="gold"
                      numberOfStars={5}
                      name="rating"
                      starDimension="1.5rem"
                      starSpacing="0.1rem"
                    />{" "}
                  </span>
                )}
              </span>
            </div>
          </div>
        );
      });
      // if (this.nearPlaces.length > 0) {
      //   Promise.all(this.nearPlaces).then(values => {
      //     this.nearPlaces = values;
      //     this.setState({ isPageShowable: true, locOrCategoryChanged: false });
      //     console.log("values", values);

      //     console.log("this.nearPlace", this.nearPlaces);
      //   });
      // }

      // console.log("this.nearPlace", this.nearPlaces, this.state.isPageShowable);

      // console.log(
      //   "done",
      //   answer.map(place => {
      //     return place.props.children[2].props.children.props.children[2];
      //   })
      // );
      console.log("done", answer);
      types = types.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
      console.log("types", types);

      return { answer, types };
    } else if (flag === "Sorting") {
      answer = nearPlaces;
      console.log(
        "Sorting ",
        answer.sort((a, b) => {
          var tempa = a;
          var tempb = b;
          if (
            tempa.props.children[2].props.children.props.children[2].split(
              " "
            )[1] === "km"
          )
            tempa =
              Number(
                tempa.props.children[2].props.children.props.children[2].split(
                  " "
                )[0]
              ) * 1000;
          else
            tempa = Number(
              tempa.props.children[2].props.children.props.children[2].split(
                " "
              )[0]
            );

          if (
            tempb.props.children[2].props.children.props.children[2].split(
              " "
            )[1] === "km"
          )
            tempb =
              Number(
                tempb.props.children[2].props.children.props.children[2].split(
                  " "
                )[0]
              ) * 1000;
          else
            tempb = Number(
              tempb.props.children[2].props.children.props.children[2].split(
                " "
              )[0]
            );

          return tempa > tempb ? 1 : -1;
        })
      );
      return { answer };
    } else if (flag === "rSorting") {
      answer = nearPlaces;
      console.log(
        "rSorting",
        answer.sort((a, b) => {
          var tempa = a;
          var tempb = b;
          if (
            tempa.props.children[2].props.children.props.children[2].split(
              " "
            )[1] === "km"
          )
            tempa =
              Number(
                tempa.props.children[2].props.children.props.children[2].split(
                  " "
                )[0]
              ) * 1000;
          else
            tempa = Number(
              tempa.props.children[2].props.children.props.children[2].split(
                " "
              )[0]
            );

          if (
            tempb.props.children[2].props.children.props.children[2].split(
              " "
            )[1] === "km"
          )
            tempb =
              Number(
                tempb.props.children[2].props.children.props.children[2].split(
                  " "
                )[0]
              ) * 1000;
          else
            tempb = Number(
              tempb.props.children[2].props.children.props.children[2].split(
                " "
              )[0]
            );

          return tempa < tempb ? 1 : -1;
        })
      );
      return { answer };
    } else if (flag === "Rating") {
      answer = nearPlaces;
      console.log(
        "Rating Star",
        nearPlaces.map(place => {
          return place.props.children[3].props.children.props.children.props
            .children[0].props.children;
        })
      );
      console.log(
        "Rating",
        answer.sort((a, b) => {
          var tempa = Number(
            a.props.children[3].props.children.props.children.props.children[0]
              .props.children
          );
          var tempb = Number(
            b.props.children[3].props.children.props.children.props.children[0]
              .props.children
          );

          return tempa > tempb ? 1 : -1;
        })
      );
      return { answer };
    } else if (flag === "rRating") {
      answer = nearPlaces;
      console.log(
        "Rating Star",
        nearPlaces.map(place => {
          return place.props.children[3].props.children.props.children.props
            .children[0].props.children;
        })
      );
      console.log(
        "Rating",
        answer.sort((a, b) => {
          var tempa = Number(
            a.props.children[3].props.children.props.children.props.children[0]
              .props.children
          );
          var tempb = Number(
            b.props.children[3].props.children.props.children.props.children[0]
              .props.children
          );

          return tempa < tempb ? 1 : -1;
        })
      );
      return { answer };
    }
  };

  filterBar = () => {
    var types;
    if (this.state.currentPage === 1) types = this.placeTypes;
    else if (this.state.currentPage === 2) types = this.placeTypes1;
    else if (this.state.currentPage === 3) types = this.placeTypes2;
    console.log("filterBar", types);
    if (types) {
      const ans = types.map((typeName, i) => {
        return (
          <option
            style={{ margin: "1rem", borderRadius: "15px", width: "5rem" }}
            onClick={() => this.handleFilter(typeName, this.state.currentPage)}
            key={i}
          >
            {typeName}
          </option>
        );
      });
      console.log(ans);
      return ans;
    } else return <option />;
  };

  handleFilter = (filterby, page) => {
    if (filterby === "all") {
      if (page === 1) {
        console.log("page ", page, " ", "filter by ", filterby);
        this.filteredPlaces = this.nearPlaces;
        this.setState({ filterApplied: true, filterValue: "All" });
      } else if (page === 2) {
        console.log("page ", page, " ", "filter by ", filterby);
        this.filteredPlaces1 = this.nearPlaces1;
        this.setState({ filterApplied: true, filterValue: "All" });
      } else if (page === 3) {
        console.log("page ", page, " ", "filter by ", filterby);
        this.filteredPlaces2 = this.nearPlaces2;
        this.setState({ filterApplied: true, filterValue: "All" });
      }
    } else {
      if (page === 1) {
        let nearPlaces = this.state.nearPlaces;
        console.log("page ", page, " ", "filter by ", filterby);
        let places = this.nearPlaces;
        // if (this.state.filterApplied) places = this.filteredPlaces;
        this.filteredPlaces = places.filter(place => {
          return (
            nearPlaces &&
            nearPlaces[Number(place.key)].types &&
            nearPlaces[Number(place.key)].types.includes(filterby)
          );
        });
        this.setState({ filterApplied: true, filterValue: filterby });
      } else if (page === 2) {
        console.log("page ", page, " ", "filter by ", filterby);
        let nearPlaces = this.state.nearPlaces1;
        let places = this.nearPlaces1;
        // if (this.state.filterApplied) places = this.filteredPlaces1;
        this.filteredPlaces1 = places.filter(place => {
          return (
            nearPlaces &&
            nearPlaces[Number(place.key)].types &&
            nearPlaces[Number(place.key)].types.includes(filterby)
          );
        });
        this.setState({ filterApplied: true, filterValue: filterby });
      } else if (page === 3) {
        console.log("page ", page, " ", "filter by ", filterby);
        let nearPlaces = this.state.nearPlaces2;
        let places = this.nearPlaces2;
        // if (this.state.filterApplied) places = this.filteredPlaces2;
        this.filteredPlaces2 = places.filter(place => {
          return (
            nearPlaces &&
            nearPlaces[Number(place.key)].types &&
            nearPlaces[Number(place.key)].types.includes(filterby)
          );
        });
        this.setState({ filterApplied: true, filterValue: filterby });
      }
    }
  };

  handleSorting = flag => {
    console.log("flag", flag);
    if (this.state.currentPage === 1) {
      let nearPlaces = this.nearPlaces;

      if (this.state.filterApplied) {
        this.getPlacesComponents(nearPlaces, flag).then(res => {
          console.log("Sorting Res O ", res);
          this.nearPlaces = res.answer;
        });
        nearPlaces = this.filteredPlaces;
      }

      this.getPlacesComponents(nearPlaces, flag).then(res => {
        console.log("Sorting Res ", res);
        if (this.state.filterApplied) this.filteredPlaces = res.answer;
        else this.nearPlaces = res.answer;
        this.setState({ sortingApplied: true, sortValue: flag });
      });
    } else if (this.state.currentPage === 2) {
      let nearPlaces = this.nearPlaces1;
      if (this.state.filterApplied) {
        this.getPlacesComponents(nearPlaces, flag).then(res => {
          console.log("Sorting Res O ", res);
          this.nearPlaces1 = res.answer;
        });
        nearPlaces = this.filteredPlaces1;
      }

      this.getPlacesComponents(nearPlaces, flag).then(res => {
        console.log("Sorting Res ", res);
        if (this.state.filterApplied) this.filteredPlaces1 = res.answer;
        else this.nearPlaces1 = res.answer;
        this.setState({ sortingApplied: true, sortValue: flag });
      });
    } else if (this.state.currentPage === 3) {
      let nearPlaces = this.nearPlaces2;
      if (this.state.filterApplied) {
        this.getPlacesComponents(nearPlaces, flag).then(res => {
          console.log("Sorting Res O ", res);
          this.nearPlaces2 = res.answer;
        });
        nearPlaces = this.filteredPlaces2;
      }

      this.getPlacesComponents(nearPlaces, flag).then(res => {
        console.log("Sorting Res ", res);
        if (this.state.filterApplied) this.filteredPlaces2 = res.answer;
        else this.nearPlaces2 = res.answer;
        this.setState({ sortingApplied: true, sortValue: flag });
      });
    }
  };

  render() {
    if (
      this.state.currentPage === 1 &&
      this.state.locOrCategoryChanged &&
      this.state.nearPlaces.length > 0
    ) {
      console.log("First Render", this.state.nearPlaces.length);
      this.getPlacesComponents(this.state.nearPlaces, "initial").then(res => {
        this.nearPlaces = res.answer;
        if (res.types) this.placeTypes = res.types;
        this.setState({ isPageShowable: true, locOrCategoryChanged: false });
      });
    }
    if (
      this.state.currentPage === 2 &&
      this.state.locOrCategoryChanged &&
      this.state.nearPlaces1.length > 0
    ) {
      this.getPlacesComponents(this.state.nearPlaces1, "initial").then(res => {
        this.nearPlaces1 = res.answer;
        if (res.types) this.placeTypes1 = res.types;
        this.setState({ isPageShowable: true, locOrCategoryChanged: false });
      });
    }
    if (
      this.state.currentPage === 3 &&
      this.state.locOrCategoryChanged &&
      this.state.nearPlaces2.length > 0
    ) {
      this.getPlacesComponents(this.state.nearPlaces2, "initial").then(res => {
        this.nearPlaces2 = res.answer;
        if (res.types) this.placeTypes2 = res.types;
        this.setState({ isPageShowable: true, locOrCategoryChanged: false });
      });
    }
    return (
      <div>
        <div
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(115, 182, 226) , rgb(148, 145, 242))",
            borderRadius: "10px",
            alignItems: "center",
            padding: "0.5rem"
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "2.5rem",
              marginTop: "1rem",
              marginBottom: "2rem",
              color: "rgb(1, 41, 68)"
            }}
          >
            <b>NearBy Search</b>
          </h2>
          <Script
            url={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`}
            onLoad={this.handleScriptLoad}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center"
            }}
          >
            <abbr title="Set Current Location">
              <button
                style={{
                  margin: "2rem",
                  marginRight: "-2rem",
                  marginTop: "1rem"
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
              style={{
                width: "50rem",
                margin: "2rem",
                marginBottom: "-1rem",
                marginTop: "1rem"
              }}
              value={this.state.query}
              onFocus={e => e.target.select()}
            />

            <button
              className="btn btn-primary"
              style={{
                margin: "2rem",
                marginLeft: "-2rem",
                marginTop: "1rem"
              }}
              onClick={this.handleRequestByName}
              disabled={this.state.query.length === 0}
            >
              <i className="fa fa-location-arrow" aria-hidden="true" />
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
              style={{
                width: "50rem",
                margin: "2rem",
                marginTop: "-1rem",
                marginBottom: "1rem"
              }}
              onFocus={e => e.target.select()}
              value={this.state.category}
            />
            <button
              className="btn btn-primary"
              style={{
                margin: "2rem",
                marginLeft: "-2rem",
                marginTop: "-1rem",
                marginBottom: "1rem"
              }}
              disabled={this.state.category.length === 0}
            >
              {" "}
              <i className="fa fa-search" />{" "}
            </button>
          </form>
        </div>
        {this.state.nearPlaces.length !== 0 ? (
          <div>
            <hr style={{ marginTop: "0.8rem" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                marginLeft: "2.5rem",
                marginRight: "2.5rem",
                borderRadius: "10px",
                marginBottom: "0.2rem",
                marginTop: "0.2rem"
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
                style={{
                  marginRight: "3rem",
                  marginLeft: "-5rem",
                  borderRadius: "20px"
                }}
                disabled={this.state.currentPage === 1}
              >
                <i className="arrow left" />
                &nbsp; Prev
              </button>
              <button
                className="btn btn-light"
                onClick={() => {
                  if (
                    (this.state.currentPage === 1 &&
                      this.state.nearPlaces.length === 20) ||
                    (this.state.currentPage === 2 &&
                      this.state.nearPlaces1.length === 20)
                  )
                    this.handleNextPage(this.state.currentPage + 1);
                }}
                style={{
                  marginLeft: "3rem",
                  marginRight: "-5rem",
                  borderRadius: "20px"
                }}
                disabled={this.state.currentPage === 3}
              >
                Next &nbsp; <i className="arrow right" />
              </button>
            </div>
            <hr style={{ marginBottom: "1rem" }} />
            {/* <div style={{ display: "flex", justifyContent: "center", flexWrap:'wrap' }}>
              <button
                className="btn btn-primary active"
                style={{ margin: "2rem", borderRadius: "15px" }}
                onClick={() => this.handleFilter("all", this.state.currentPage)}
              >
                {" "}
                Show all
              </button>
              <button
                className="btn btn-primary"
                style={{ margin: "2rem", borderRadius: "15px" }}
                onClick={() =>
                  this.handleFilter("food", this.state.currentPage)
                }
              >
                {" "}
                Food
              </button>
              <button
                className="btn btn-primary"
                style={{ margin: "2rem", borderRadius: "15px" }}
                onClick={() =>
                  this.handleFilter("school", this.state.currentPage)
                }
              >
                {" "}
                School
              </button>
              <button
                className="btn btn-primary"
                style={{ margin: "2rem", borderRadius: "15px" }}
                onClick={() =>
                  this.handleFilter("health", this.state.currentPage)
                }
              >
                {" "}
                Health
              </button>
            </div> */}
            {/* <div
              className="btn-group btn-group-toggle"
              data-toggle="buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap"
              }}
            >
              <button
                className="btn btn-outline-dark active"
                onClick={() => this.handleFilter("all", this.state.currentPage)}
                style={{ margin: "1rem", borderRadius: "15px" }}
              >
                <input
                  type="radio"
                  name="options"
                  id="option1"
                  autoComplete="off"
                />{" "}
                All
              </button>
              {this.filterBar()}
            </div> */}
            <div
            // style={{
            //   display: "flex",
            //   flexWrap: "wrap",
            //   justifyContent: "center"
            // }}
            >
              {/* <ul
                style={{ display: "flex", flexWrap: "wrap" }}
              >
                <li
                  style={{
                    margin: "1rem",
                    borderRadius: "15px",
                    width: "5rem"
                  }}
                  onClick={() =>
                    this.handleFilter("all", this.state.currentPage)
                  }
                >
                  All
                </li>
                {this.filterBar()}
              </ul> */}
              <div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center"
                  }}
                >
                  <div style={{ flex: "1" }}>
                    <div
                      style={{
                        marginRight: "2%",
                        marginLeft: "10%",
                        marginBottom: "1.5rem"
                      }}
                    >
                      <label>
                        <b>Filter By</b>&nbsp;&nbsp;&nbsp;&nbsp;
                      </label>
                      <div>
                        <select
                          className="form-control"
                          value={this.state.filterValue}
                          onChange={e =>
                            this.handleFilter(
                              e.target.value,
                              this.state.currentPage
                            )
                          }
                        >
                          <option value="all">All</option>
                          {this.filterBar()}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: "1" }}>
                    <div
                      style={{
                        marginRight: "10%",
                        marginLeft: "2%"
                      }}
                    >
                      <label
                      // className="control-label col-sm-offset-2 col-sm-2"
                      // htmlFor="sorting"
                      >
                        <b>Sort By</b>&nbsp;&nbsp;&nbsp;&nbsp;
                      </label>
                      <div
                      // className="col-sm-4 col-md-4"
                      >
                        <select
                          value={this.state.sortValue}
                          className="form-control"
                          onChange={e => {
                            if (e.target.value !== "none")
                              this.handleSorting(e.target.value);
                          }}
                        >
                          <option value="none"> ------------ </option>
                          <option value="Rating">Rating Assending</option>
                          <option value="rRating">Rating Desending</option>
                          <option value="Sorting">Distance Assending</option>
                          <option value="rSorting">Distance Desending</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <button
                onClick={() => {
                  this.handleSorting("Sorting");
                }}
              >
                asc
              </button>
              <button
                onClick={() => {
                  this.handleSorting("rSorting");
                }}
              >
                des
              </button>
              <button
                onClick={() => {
                  this.handleSorting("Rating");
                }}
              >
                Rat
              </button> */}
            </div>
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
              this.state.filterApplied ? (
                this.filteredPlaces
              ) : (
                this.nearPlaces
              )
            ) : (
              <div>
                <div
                  className="spinner-grow text-danger"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-warning"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-dark"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
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
              this.state.filterApplied ? (
                this.filteredPlaces1
              ) : (
                this.nearPlaces1
              )
            ) : (
              <div>
                <div
                  className="spinner-grow text-danger"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-warning"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-info"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
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
              this.state.filterApplied ? (
                this.filteredPlaces2
              ) : (
                this.nearPlaces2
              )
            ) : (
              <div>
                <div
                  className="spinner-grow text-danger"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-warning"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-info"
                  style={{ marginTop: "9rem", height: "5rem", width: "5rem" }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
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
            {!this.state.currentPlaceloading ? (
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
                        <span style={{ fontWeight: "bold" }}>
                          Rating:&nbsp;
                        </span>
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
                        <span style={{ fontWeight: "bold" }}>
                          Address:&nbsp;
                        </span>
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
                          Location:&nbsp;{" "}
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
                        <span style={{ fontWeight: "bold" }}> Website </span>
                        <a
                          href={
                            this.state.currentPlaceDetail.data.result.website
                          }
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
                  <div>
                    {" "}
                    {this.state.currentPlaceDetail !== null &&
                    this.state.currentPlaceDetail.data.result &&
                    this.state.currentPlaceDetail.data.result.reviews ? (
                      <div>
                        <span>
                          {" "}
                          <div
                            style={{
                              fontWeight: "bold",
                              fontSize: "1.5rem",
                              marginBottom: "2rem",
                              marginTop: "1rem",
                              textAlign: "center"
                            }}
                          >
                            <hr
                              style={{
                                borderColor: "rgb(50, 50, 51)",
                                marginRight: "0.2rem",
                                marginLeft: "0.2rem"
                              }}
                            />
                            Reviews
                            <hr
                              style={{
                                borderColor: "rgb(50, 50, 51)",
                                marginRight: "0.2rem",
                                marginLeft: "0.2rem"
                              }}
                            />
                          </div>
                          {this.state.currentPlaceDetail.data.result.reviews.map(
                            (review, i) => {
                              return (
                                <div
                                  key={i}
                                  // style={{
                                  //   display: "flex",
                                  //   flexWrap: "wrap",
                                  //   flexGrow: "initial"
                                  // }}
                                >
                                  <span>
                                    <a
                                      href={review.author_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <img
                                        src={review.profile_photo_url}
                                        alt={"P"}
                                        style={{
                                          height: "2rem",
                                          width: "2rem"
                                        }}
                                      />
                                      <span
                                        style={{
                                          marginRight: "0.5rem",
                                          marginLeft: "0.5rem",
                                          fontWeight: "bold"
                                        }}
                                      >
                                        {review.author_name}
                                      </span>
                                    </a>
                                    &nbsp;
                                    <small>
                                      <i>{review.relative_time_description}</i>
                                    </small>
                                    <span
                                      style={{
                                        color: "gold",
                                        marginLeft: "0.3rem"
                                      }}
                                    >
                                      {" "}
                                      <b>{review.rating}: </b>
                                      <StarRatings
                                        rating={review.rating}
                                        starRatedColor="gold"
                                        numberOfStars={5}
                                        name="rating"
                                        starDimension="1rem"
                                        starSpacing="0.05rem"
                                      />{" "}
                                    </span>
                                  </span>
                                  <span
                                    style={{
                                      marginTop: "0.2rem",
                                      marginBottom: "0.7rem"
                                    }}
                                  >
                                    <br />
                                    <span>
                                      &nbsp;&nbsp;&nbsp;&nbsp;{review.text}
                                    </span>
                                  </span>
                                  <hr
                                    style={{
                                      borderColor: "silver",
                                      marginRight: "0.2rem",
                                      marginLeft: "0.2rem"
                                    }}
                                  />
                                </div>
                              );
                            }
                          )}
                        </span>
                      </div>
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
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "warp"
                }}
              >
                <div
                  className="spinner-grow text-danger"
                  style={{
                    marginTop: "9rem",
                    height: "3rem",
                    width: "3rem",
                    marginLeft: "10rem"
                  }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-warning"
                  style={{
                    marginTop: "9rem",
                    height: "3rem",
                    width: "3rem",
                    marginLeft: "15rem"
                  }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <div
                  className="spinner-grow text-info"
                  style={{
                    marginTop: "9rem",
                    height: "3rem",
                    width: "3rem",
                    marginLeft: "15rem"
                  }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default PlacesNearMe;
