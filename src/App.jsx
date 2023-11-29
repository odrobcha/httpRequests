import React, { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import {updateUsePlaces, fetchUserPlaces} from './http';
import Error from './components/Error';

function App() {

  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();
  const [userPlacesIsLoading, setUserPlacesIsLoading] = useState(false)

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setErrorUpdatingPlaces(null);
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      const res = await updateUsePlaces([selectedPlace, ...userPlaces]);
    } catch (e) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: e.message || "Something went wrong"});
    }

  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setErrorUpdatingPlaces(null);
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );


    try {
      const res = await updateUsePlaces(userPlaces.filter(place => place.id !== selectedPlace.current.id));

    } catch(e) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({message: e.message || "Something went wrong"});
    }

    setModalIsOpen(false);

  }, [userPlaces]);

  const handleError = ()=>{
    setErrorUpdatingPlaces(null)
  };

  useEffect(()=>{
    const fetchSavedPlaces = async ()=>{
      setUserPlacesIsLoading(true)
      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places);
        setUserPlacesIsLoading(false)
      } catch {
        setUserPlaces([]);
        setUserPlacesIsLoading(false)
      }
    }
    fetchSavedPlaces();
  }, []);


  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && <Error message={errorUpdatingPlaces.message}
               title='Error occured'
               onConfirm={handleError}
        />}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>


      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>

        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          isLoading={userPlacesIsLoading}
          loadingText='Data is loading...'
          onSelectPlace={handleStartRemovePlace}
        />

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
