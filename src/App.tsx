import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Select, { SingleValue } from "react-select";
import "./App.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";

function App() {
  type OptionType = {
    value: string;
    label: string;
  };

  type CharacterType = {
    id: number;
    name: string;
    species: string;
    status: string;
    gender: string;
    image: string;
    origin: { name: string };
  };

  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType | null>();
  const [highlightedCharacter, setHighlightedCharacter] =
    useState<CharacterType | null>();
  const [team, setTeam] = useState<CharacterType[]>(
    JSON.parse(localStorage.getItem("team") || "")
  );
  const [alertText, setAlertText] = useState("");

  // Get all the character from the API
  const getAllCharacters = async () => {
    try {
      const results = await axios.get(
        `https://rickandmortyapi.com/api/character`
      );

      if (results) {
        let tempCharacters = results.data.results;

        if (results?.data?.info?.pages) {
          for (let i = 2; i <= results.data.info.pages; i++) {
            const pageResults = await axios.get(
              `https://rickandmortyapi.com/api/character?page=${i}`
            );

            if (pageResults) {
              tempCharacters = [...tempCharacters, ...pageResults.data.results];
            }
          }
        }

        setCharacters(tempCharacters);
      }
    } catch (error) {
      console.error("Error getting all character", error);
    }
  };

  // Get the data for a single character from the API
  const getCharacter = async (option: SingleValue<OptionType>) => {
    try {
      if (option) {
        let result = await axios.get(option.value);

        if (result) {
          setSelectedCharacter(result.data);
        }
      }
    } catch (error) {
      console.error("Error getting character stats", error);
    }
  };

  // Add a character to the team
  const addCharacterToTeam = () => {
    let exists: CharacterType | undefined;

    if (selectedCharacter) {
      if (team && team.length) {
        // Check to see if the character is already on the team
        exists = team.find((item) => item.name === selectedCharacter.name);
      }

      if (exists) {
        setAlertText(`${selectedCharacter.name} is already on the team!`);
      } else {
        const newTeam = [...team, selectedCharacter];
        setTeam(newTeam);
        setSelectedCharacter(null);
      }
    }
  };

  // Remove a character from the team
  const removeCharacterFromTeam = (characterName: string) => {
    if (characterName) {
      let tempTeam = [...team];

      tempTeam = tempTeam.filter((item) => {
        return item.name !== characterName;
      });

      setTeam(tempTeam);
    }
  };

  // Get all the character on init
  useEffect(() => {
    getAllCharacters();
  }, []);

  // Store the character team in local storage whenever the team gets updated
  useEffect(() => {
    localStorage.setItem("team", JSON.stringify(team));
  }, [team]);

  return (
    <div className="App">
      <Dashboard>
        {alertText ? (
          <Toast
            className="toast align-items-center text-white bg-primary border-0"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">{alertText}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Close"
                onClick={() => setAlertText("")}
              ></button>
            </div>
          </Toast>
        ) : null}

        {highlightedCharacter ? (
          <ModalContainer>
            <div className="modal" style={{ display: "block" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{highlightedCharacter.name}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => setHighlightedCharacter(null)}
                    ></button>
                  </div>
                  <ModalFlex className="modal-body">
                    <Image
                      src={highlightedCharacter.image}
                      alt={`Front default sprite for ${highlightedCharacter.name}`}
                    />

                    <Stats>
                      <Stat>ID: {highlightedCharacter.id}</Stat>

                      <Stat>Gender: {highlightedCharacter.gender}</Stat>

                      <Stat>Species: {highlightedCharacter.species}</Stat>

                      <Stat>Origin: {highlightedCharacter.origin.name}</Stat>

                      <Stat>Status: {highlightedCharacter.status}</Stat>
                    </Stats>
                  </ModalFlex>
                </div>
              </div>
            </div>
          </ModalContainer>
        ) : null}

        <CharacterSelector>
          {characters && characters.length ? (
            <SelectContainer>
              <Select
                placeholder="Select a Character"
                options={characters.map(
                  (item: { name: string; url: string }) => {
                    return { label: item.name, value: item.url };
                  }
                )}
                onChange={(option) => {
                  getCharacter(option);
                }}
                isDisabled={team && team.length === 6}
                isSearchable
              ></Select>
            </SelectContainer>
          ) : null}

          {selectedCharacter ? (
            <div className="card">
              <img
                onClick={() => setHighlightedCharacter(selectedCharacter)}
                src={selectedCharacter.image}
                alt={`Profile for ${selectedCharacter.name}`}
                style={{
                  height: "294px",
                  width: "294px",
                  backgroundColor: "#0f0d12",
                }}
              />
              <div className="card-body">
                <h5 className="card-title mb-3">{selectedCharacter.name}</h5>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    addCharacterToTeam();
                  }}
                >
                  Add to Team
                </button>
              </div>
            </div>
          ) : null}
        </CharacterSelector>

        <TeamContainer>
          <TeamTitle>Dream Team</TeamTitle>
          <Team>
            {team && team.length
              ? team.map((item, index) => {
                  return (
                    <TeamSpot key={index}>
                      <Image
                        onClick={() => setHighlightedCharacter(item)}
                        src={item.image}
                        alt={`Image for ${item.name}`}
                      />
                      <Name>{item.name}</Name>
                      <Button
                        className="btn btn-danger"
                        onClick={() => {
                          removeCharacterFromTeam(item.name);
                        }}
                      >
                        Remove
                      </Button>
                    </TeamSpot>
                  );
                })
              : null}

            {!team || (team && team.length < 6)
              ? [...Array(team && team.length ? 6 - team.length : 6)].map(
                  (value: undefined, index: number) => (
                    <TeamSpot key={index}></TeamSpot>
                  )
                )
              : null}
          </Team>
        </TeamContainer>
      </Dashboard>
    </div>
  );
}

export default App;

const Dashboard = styled.div`
  display: flex;
  background-color: #0f0d12;
  height: 100vh;
  width: 100vw;
`;

const SelectContainer = styled.div`
  text-align: left;
  text-transform: capitalize;
  font-size: 18px;
`;

const CharacterSelector = styled.div`
  border: 2px solid black;
  width: 300px;
  height: 450px;
  margin: 70px;
  background-color: #ecf0f1;
`;

const Image = styled.img`
  cursor: pointer;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Name = styled.p`
  margin: 0px 10px 20px 10px;
  font-weight: 500;
  line-height: 1;
  text-transform: capitalize;
`;

const TeamContainer = styled.div`
  border: 2px solid black;
  flex: 1;
  height: 450px;
  background-color: #ecf0f1;
  margin: 70px;
`;

const TeamTitle = styled.h2`
  margin: 40px 0px 30px 0px;
  font-size: 50px;
  font-weight: normal;
  letter-spacing: 1px;
`;

const Team = styled.div`
  display: flex;
  padding: 40px;
  margin: 0px -20px;
`;

const Button = styled.button`
  border-radius: 0px !important;
`;

const TeamSpot = styled.div`
  width: calc(100% / 6);
  border: 2px dashed #0f0d12;
  margin: 0px 20px;
  position: relative;
  min-height: 215px;
  display: flex;
  flex-direction: column;

  ${Image} {
    position: relative;
    height: 130px;
    margin-bottom: 10px;
  }

  ${Name} {
    margin-bottom: 10px;
  }

  ${Button} {
    width: 100%;
    margin-top: auto;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2;
  left: 0;
  top: 0;

  ${Image} {
    position: relative;
    width: 200px;
  }

  ${Name} {
    margin-bottom: 30px;
  }
`;

const Stat = styled.p`
  font-size: 18px;
  margin-bottom: 5px;

  &:last-of-type {
    margin-bottom: 0px;
  }
`;

const Toast = styled.div`
  position: absolute;
  left: 50%;
  top: 10px;
  transform: translateX(-50%);
  display: block !important;
`;

const Stats = styled.div`
  text-align: left;
  margin-left: 20px;
`;

const ModalFlex = styled.div`
  display: flex;
`;
