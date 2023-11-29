import { useEffect, useState } from 'react';
import Places from './Places.jsx';
import Error from './Error';
import { sortPlacesByDistance } from '../loc';
import {fetchAvailablePlaces} from '../http';

export default function AvailablePlaces ({ onSelectPlace }) {
    const [availablePlaces, setAvailablePlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState();

    /*
    fetch('http://localhost:3000/places')
              .then(res => {
                  return res.json();

              })
              .then(resData => {

                  setAvailablePlaces(resData.places);
              })
              .catch(err => {
                  console.log(err);
              });
     */
    useEffect(() => {
        const fetchPlaces = async () => {
            setIsLoading(true);
            setHasError(null);
            try {
                const places = await fetchAvailablePlaces();
                navigator.geolocation.getCurrentPosition((position)=>{
                    if(position){
                        const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude);
                        setAvailablePlaces(sortedPlaces);
                    } else {
                        setAvailablePlaces(places);
                    }
                    setIsLoading(false);
                });
            } catch (error) {
                setHasError({message: error.message || "Something happened. Please try again later"});
                setIsLoading(false);
            }
        };

        fetchPlaces();

    }, []);
    const handleError = () => {
        setHasError(null);
    };
    return (
      <>
          {!isLoading && hasError && <Error title="Error occurred" onConfirm={handleError} message={hasError.message}/>}
          {!hasError && <Places
            title="Available Places"
            places={availablePlaces}
            isLoading={isLoading}
            loadingText='Data is loading...'
            fallbackText="No places available."
            onSelectPlace={onSelectPlace}
          />
          }

      </>
    );
}
