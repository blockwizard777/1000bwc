import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Stage, Layer, Rect, Image as KonvaImage, Text } from "react-konva";
import { io, Socket } from "socket.io-client";
import debounce from "lodash.debounce";
import { FaComments } from "react-icons/fa"; // Import the icon from react-icons
import axios from "axios"; // Import axios
import ReactTable from 'react-table'; // Import React Table
import { useTable } from 'react-table'; // Import useTable from react-table

interface ActionLog {
  player: string;
  action: string;
  victim?: string;
  backgroundColor: string;
}

const Game: React.FC = () => {
  const location = useLocation();
  const { roomName, username, isHost } = location.state; // Add isHost to destructuring
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rectangles, setRectangles] = useState<any[]>([]); // Remove rectangles
  const [images, setImages] = useState<any[]>([]); // State to store images
  const [chatVisible, setChatVisible] = useState(false); // State to control chat visibility
  const [messages, setMessages] = useState<string[]>([]); // State to store chat messages
  const [newMessage, setNewMessage] = useState(""); // State to store the new message input
  const [deckMenuVisible, setDeckMenuVisible] = useState(false); // State to control deck menu visibility
  const deckButtonRef = useRef<HTMLButtonElement>(null); // Ref to get Deck button position
  const [handVisible, setHandVisible] = useState(false); // State to control hand visibility
  const [handCards, setHandCards] = useState<string[]>([]); // State to store hand cards
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // State to store the selected card
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // State to store the selected card index
  const [cardData, setCardData] = useState<any[]>([]); // State to store card data
  const [logMoves, setLogMoves] = useState(false); // Add logMoves state and set it to false by default
  const [additionalDeckMenuVisible, setAdditionalDeckMenuVisible] = useState(false); // State to control additional deck menu visibility
  const [selectedAdditionalDeck, setSelectedAdditionalDeck] = useState<string | null>(null); // State to store the selected additional deck
  const additionalDeckButtonRef = useRef<HTMLButtonElement>(null); // Ref to get Additional Deck button position
  const [showSettingsPopup, setShowSettingsPopup] = useState(false); // State to control settings popup visibility

  const handContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingHand, setIsDraggingHand] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [peekCards, setPeekCards] = useState<string[]>([]); // State to store peeked cards
  const [showPeekPopup, setShowPeekPopup] = useState(false); // State to control peek popup visibility
  const [cardOptions, setCardOptions] = useState<string[]>([]); // State to store card options

  const [scores, setScores] = useState<any>({});
  const [showScoresPopup, setShowScoresPopup] = useState(false);
  const [showCreateScorePopup, setShowCreateScorePopup] = useState(false);
  const [showDeleteScorePopup, setShowDeleteScorePopup] = useState(false);
  const [scoresVisible, setScoresVisible] = useState(false); // State to control scores visibility
  const [editMenuVisible, setEditMenuVisible] = useState(false); // State to control edit menu visibility
  const [showAddScorePopup, setShowAddScorePopup] = useState(false); // State to control add score popup visibility
  const [showRemoveScorePopup, setShowRemoveScorePopup] = useState(false); // State to control remove score popup visibility

  const [showPlayersPopup, setShowPlayersPopup] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null); // State to store the selected player
  const [showPlayerActionsPopup, setShowPlayerActionsPopup] = useState(false); // State to control player actions popup visibility

  const [viewingCards, setViewingCards] = useState<string[]>([]); // State to store the cards being viewed
  const [viewingCardIndices, setViewingCardIndices] = useState<number[]>([]); // State to store the indices of the cards being viewed
  const [revealLimit, setRevealLimit] = useState<number | null>(null); // State to store the reveal limit

  const [stealCards, setStealCards] = useState<string[]>([]); // State to store cards available for stealing
  const [showStealPopup, setShowStealPopup] = useState(false); // State to control steal popup visibility
  const [stealCardIndices, setStealCardIndices] = useState<number[]>([]); // State to store indices of cards to steal

  const [playerCardCounts, setPlayerCardCounts] = useState<{ [key: string]: number }>({}); // State to store card counts
  const [showCardCountPopup, setShowCardCountPopup] = useState(false); // State to control card count popup visibility

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/scores`, { params: { roomName } });
        if (response.data.success) {
          setScores(response.data.scores);
        }
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    };

    fetchScores();
  }, [roomName]);

  const handleCreateScore = async () => {
    const scoreName = prompt("Enter the name of the new score:");
    const defaultValue = parseInt(prompt("Enter the default value for the new score:")||"", 10);

    if (scoreName && !isNaN(defaultValue)) {
      try {
        const response = await axios.post("http://localhost:3000/create-score", { roomName, scoreName, defaultValue });
        if (response.data.success) {
          setScores((prevScores: any) => ({
            ...prevScores,
            [scoreName]: prevScores.Points.map((player: any) => ({ name: player.name, value: defaultValue })),
          }));
          if (socket) {
            socket.emit("updateScores", { roomName, scores: { ...scores, [scoreName]: scores.Points.map((player: any) => ({ name: player.name, value: defaultValue })) } });
          }
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error creating score:", error);
      }
    }
  };

  const handleDeleteScore = async (scoreName: string) => {
    try {
      const response = await axios.post("http://localhost:3000/delete-score", { roomName, scoreName });
      if (response.data.success) {
        setScores((prevScores: any) => {
          const newScores = { ...prevScores };
          delete newScores[scoreName];
          return newScores;
        });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting score:", error);
    }
  };

  const handleHandMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingHand(true);
    setDragStartX(e.clientX);
    if (handContainerRef.current) {
      setScrollStartX(handContainerRef.current.scrollLeft);
    }
  };

  const handleHandMouseMove = (e: MouseEvent) => {
    if (isDraggingHand && handContainerRef.current) {
      const dx = e.clientX - dragStartX;
      handContainerRef.current.scrollLeft = scrollStartX - dx;
    }
  };

  const handleHandMouseUp = () => {
    setIsDraggingHand(false);
  };

  const handleHandWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (handContainerRef.current) {
      handContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  useEffect(() => {
    if (isDraggingHand) {
      window.addEventListener("mousemove", handleHandMouseMove);
      window.addEventListener("mouseup", handleHandMouseUp);
    } else {
      window.removeEventListener("mousemove", handleHandMouseMove);
      window.removeEventListener("mouseup", handleHandMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleHandMouseMove);
      window.removeEventListener("mouseup", handleHandMouseUp);
    };
  }, [isDraggingHand]);

  const loadImage = (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        console.log(`Image loaded: ${src}`);
        resolve(img);
      };
      img.onerror = (err) => {
        console.error(`Error loading image: ${src}`, err);
        reject(err);
      };
    });
  };

  const loadCardData = async (cardUrl: string) => {
    try {
      const response = await axios.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
      return response.data;
    } catch (error) {
      console.error("Error loading card data:", error);
      return null;
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Joining game room:", roomName);
      newSocket.emit("joinGame", { roomName, username });
    });

    newSocket.on("updateRectangles", (updatedRectangles) => {
      setRectangles(updatedRectangles);
    });

    newSocket.on("updateImages", async (updatedImages) => {
      try {
        const loadedImages = await Promise.all(
          updatedImages.map(async (img: any) => {
            const image = await loadImage(img.src);
            const data = img.data || await loadCardData(img.src);
            return { ...img, image, data };
          })
        );
        console.log("Loaded images:", loadedImages);
        setImages(loadedImages);
      } catch (error) {
        console.error("Error loading images:", error);
      }
    });

    newSocket.on("chatMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("updateHands", async () => {
      console.log("Received updateHands event");
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}`);
        const handUrls = response.data.hand.map((card: string) => `http://localhost:3000${card}`);
        setHandCards(handUrls);
        console.log("Updated hand cards:", handUrls);
      } catch (error) {
        console.error("Error fetching hand cards:", error);
      }
    });


    newSocket.on("updateScores", (updatedScores) => {
      console.log("Received updateScores event", updatedScores);
      setScores((prevScores: any) => ({
        ...prevScores,
        ...updatedScores
      }));
      console.log("Scores updated on client:", updatedScores); // Log when the client receives the updated scores
    });

    newSocket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    const fetchHandCards = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}.json`);
        setHandCards(response.data.hand);
        //setIsHost(response.data.isHost); // Retrieve isHost value
      } catch (error) {
        console.error("Error fetching hand cards:", error);
      }
    };

    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/players`);
        if (response.data.success) {
          setPlayers(response.data.players);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchHandCards();
    fetchPlayers();

    return () => {
      newSocket.disconnect();
    };
  }, [roomName, username]);

  const debouncedUpdateRectangles = useCallback(
    debounce((newRectangles) => {
      if (socket) {
        socket.emit("updateRectangles", { roomName, rectangles: newRectangles });
      }
    }, 300),
    [socket, roomName]
  );

  const debouncedUpdateImagePositions = useCallback(
    debounce((newImages) => {
      if (socket) {
        socket.emit("updateImagePositions", { roomName, images: newImages });
      }
    }, 300),
    [socket, roomName]
  );

  const handleImageDragEnd = (e: any, index: number) => {
    const newImages = images.slice();
    newImages[index] = {
      ...newImages[index],
      x: e.target.x(),
      y: e.target.y(),
    };
    setImages(newImages);
    debouncedUpdateImagePositions(newImages);

    if (logMoves) {
      logAction({
        player: username,
        action: "moved an image",
        backgroundColor: "#ffcccc", // Very light red background
      });
    }
  };

  const handleSendMessage = () => {
    if (socket && newMessage.trim()) {
      socket.emit("chatMessage", { roomName, message: `${username}: ${newMessage}` });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const logAction = ({ player, action, victim, backgroundColor }: ActionLog) => {
    const message = victim ? `<b>${player}</b> ${action} <b>${victim}</b>` : `<b>${player}</b> ${action}`;
    const formattedMessage = `<span style="background-color: ${backgroundColor}; padding: 5px; border-radius: 5px;">${message}</span>`;
    if (socket) {
      socket.emit("chatMessage", { roomName, message: formattedMessage });
    }
  };

  const handleDeckButtonClick = () => {
    setDeckMenuVisible(!deckMenuVisible);
  };

  const handleDeckMenuOptionClick = (option: string) => {
    console.log(`Deck menu option selected: ${option}`);
    setDeckMenuVisible(false);
    if (socket) {
      if (option === "Draw") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("drawCard", { roomName, username, deckName: "main" });
            } else {
              logAction({ player: username, action: "tried to draw from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "Deal") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("dealCard", { roomName, username, deckName: "main" });
            } else {
              logAction({ player: username, action: "tried to deal from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "To Field") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("drawCardToField", { roomName, username, deckName: "main" });
            } else {
              logAction({ player: username, action: "tried to play from an empty deck", backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "Peek") {
        const count = parseInt(prompt("Enter the number of cards to view:")||"", 10);
        if (count > 0) {
          axios.post("http://localhost:3000/peek-deck", { roomName, deckName: "main", count })
            .then(response => {
              if (response.data.success) {
                setPeekCards(response.data.cards.map((card: string) => `http://localhost:3000${card}`));
                setShowPeekPopup(true);
                logAction({ player: username, action: `viewed <b>${count}</b> cards from the deck`, backgroundColor: "#e6e6fa" }); // Light purple background
              } else {
                alert(response.data.message);
              }
            })
            .catch(error => {
              console.error("Error peeking deck:", error);
            });
        }
      }
    }
  };

  const handleAdditionalDeckButtonClick = async () => {
    if (additionalDeckMenuVisible) {
      setSelectedAdditionalDeck(null); // Close all sub-popups
    }
    setAdditionalDeckMenuVisible(!additionalDeckMenuVisible);
    if (!additionalDeckMenuVisible) {
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/decks`);
        const uniqueDecks = response.data.decks.filter((deck: string) => deck !== "main" && deck !== "discard");
        setAvailableDecks(uniqueDecks);
      } catch (error) {
        console.error("Error fetching additional decks:", error);
      }
    }
  };

  const handleAdditionalDeckMenuOptionClick = (deckName: string, option: string) => {
    console.log(`Additional deck menu option selected: ${option} for deck: ${deckName}`);
    setSelectedAdditionalDeck(deckName);
    setAdditionalDeckMenuVisible(false);
    if (socket) {
      if (option === "Draw") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("drawCard", { roomName, username, deckName });
            } else {
              logAction({ player: username, action: `tried to draw from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "Deal") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("dealCard", { roomName, username, deckName });
            } else {
              logAction({ player: username, action: `tried to deal from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "To Field") {
        axios.post("http://localhost:3000/peek-deck", { roomName, deckName, count: 1 })
          .then(response => {
            if (response.data.success && response.data.cards.length > 0) {
              socket.emit("drawCardToField", { roomName, username, deckName });
            } else {
              logAction({ player: username, action: `tried to play from an empty deck (${deckName})`, backgroundColor: "#ffcccc" }); // Light red background
            }
          })
          .catch(error => {
            console.error("Error checking deck:", error);
          });
      } else if (option === "Peek") {
        const count = parseInt(prompt("Enter the number of cards to view:")||"", 10);
        if (count > 0) {
          axios.post("http://localhost:3000/peek-deck", { roomName, deckName, count })
            .then(response => {
              if (response.data.success) {
                setPeekCards(response.data.cards.map((card: string) => `http://localhost:3000${card}`));
                setShowPeekPopup(true);
                logAction({ player: username, action: `viewed <b>${count}</b> cards from the <b>${deckName}</b> deck`, backgroundColor: "#e6e6fa" }); // Light purple background
              } else {
                alert(response.data.message);
              }
            })
            .catch(error => {
              console.error("Error peeking deck:", error);
            });
        }
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("cardDrawnToField", async (cardUrl) => {
        const flippedCardUrl = "http://localhost:3000/assets/FLIPPED.png";
        const img = new Image();
        img.src = flippedCardUrl;
        img.onload = async () => {
          const width = 100;
          const height = width / 0.6; // Set aspect ratio to 0.6:1
          const cardData = await loadCardData(cardUrl);
          const newCard = {
            x: 50,
            y: 50,
            width,
            height,
            image: img, // Ensure the image is set correctly
            src: flippedCardUrl,
            data: { originalCard: cardUrl, ...cardData },
          };
          setImages((prevImages) => [...prevImages, newCard]);
          socket.emit("updateImagePositions", { roomName, images: [...images, newCard] }); // Ensure the server is updated with the new image
        };
      });
    }
  }, [socket, images]);

  const handleHandButtonClick = async () => {
    setHandVisible(!handVisible);
    if (!handVisible) {
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${username}`);
        const handUrls = response.data.hand.map((card: string) => `http://localhost:3000${card}`);
        setHandCards(handUrls);
      } catch (error) {
        console.error("Error fetching hand cards:", error);
      }
    }
  };

  const handleHandCardClick = (card: string, index: number) => {
    setSelectedCard(card);
    setSelectedCardIndex(index);
    if (card.includes("BLANK.png")) {
      setCardOptions(["UPLOAD", "DISCARD"]);
    } else {
      setCardOptions(["PLAY", "PLAY FLIPPED", "DISCARD"]);
    }
  };

  const handlePlayCard = async () => {
    if (socket && selectedCard) {
      const cardUrl = selectedCard.startsWith("/assets/") ? `http://localhost:3000${selectedCard}` : selectedCard;
      const img = new Image();
      img.src = cardUrl;
      img.onload = async () => {
        const aspectRatio = img.width / img.height;
        const width = 100;
        const height = width / aspectRatio;
        const centerX = window.innerWidth / 2 - width / 2;
        const centerY = window.innerHeight / 2 - height / 2;
        let cardData;
        try {
          const response = await axios.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
          cardData = response.data;
        } catch (error) {
          console.error("Error loading card data:", error);
          cardData = {
            description: "",
            values: [],
            additional: []
          };
        }
        socket.emit("playCard", { roomName, username, card: cardUrl, width, height, x: centerX, y: centerY, data: cardData });
      };
      setSelectedCard(null);
      setSelectedCardIndex(null);
      setHandVisible(false);
    }
  };

  const handlePlayFlippedCard = async () => {
    if (socket && selectedCard) {
      const flippedCardUrl = "http://localhost:3000/assets/FLIPPED.png";
      const img = new Image();
      img.src = flippedCardUrl;
      img.onload = async () => {
        const width = 100;
        const height = width / 0.6; // Set aspect ratio to 0.6:1
        const centerX = window.innerWidth / 2 - width / 2;
        const centerY = window.innerHeight / 2 - height / 2;
        let cardData;
        try {
          const response = await axios.get(selectedCard.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
          cardData = response.data;
        } catch (error) {
          console.error("Error loading card data:", error);
          cardData = {
            description: "",
            values: [],
            additional: []
          };
        }
        cardData.originalCard = selectedCard;
        socket.emit("playCard", { roomName, username, card: flippedCardUrl, width, height, x: centerX, y: centerY, data: cardData });
        socket.emit("removeCardFromHand", { roomName, username, card: selectedCard }); // Remove the original card from the hand
        socket.emit("updateHands"); // Notify server to update hands
      };
      setSelectedCard(null);
      setSelectedCardIndex(null);
      setHandVisible(false);
    }
  };

  const handleDiscardCard = () => {
    if (socket && selectedCard) {
      socket.emit("discardCard", { roomName, username, card: selectedCard });
      setSelectedCard(null);
      setSelectedCardIndex(null);
      setHandVisible(false);
    }
  };

  const handleRevealCard = (index: number) => {
    if (revealLimit !== null && viewingCardIndices.length < revealLimit) {
      setViewingCardIndices((prevIndices) => [...prevIndices, index]);
    }
  };

  const handleUploadCard = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("cardImage", file);
        formData.append("roomName", roomName);
        formData.append("username", username);

        try {
          const response = await axios.post("http://localhost:3000/upload-card-image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data.success) {
            const newCardUrl = response.data.cardUrl;
            const updatedHandCards = [...handCards];
            const blankCardIndex = updatedHandCards.indexOf(selectedCard!);
            if (blankCardIndex > -1) {
              updatedHandCards.splice(blankCardIndex, 1);
            }
            updatedHandCards.push(newCardUrl);
            setHandCards(updatedHandCards);
            setSelectedCard(null);
            setSelectedCardIndex(null);
            setHandVisible(false);
          } else {
            alert("Failed to upload card image.");
          }
        } catch (error) {
          console.error("Error uploading card image:", error);
          alert("Error uploading card image.");
        }
      }
    };
    fileInput.click();
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setSelectedCardIndex(null);
  };

  const [selectedKonvaCard, setSelectedKonvaCard] = useState<any>(null);
  const [showInspectPopup, setShowInspectPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showAdditionalPopup, setShowAdditionalPopup] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editValues, setEditValues] = useState<number[]>([]);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  const handleKonvaCardClick = (card: any, e: any) => {
    e.cancelBubble = true; // Stop the event from propagating to the canvas
    if (card.src.includes("BLANK.png")) {
      console.warn("Blank cards cannot be clicked.");
      return;
    }
    setSelectedKonvaCard(card);
    setPopupPosition({ x: e.evt.clientX, y: e.evt.clientY });
  };

  const handleCanvasClick = () => {
    setSelectedKonvaCard(null);
    setPopupPosition(null);
    setShowInspectPopup(false); // Close the inspect popup if open
    setShowPeekPopup(false); // Close the peek popup if open
  };

  const handleInspect = () => {
    setShowInspectPopup(true);
  };

  const handleEdit = () => {
    setEditDescription(selectedKonvaCard.data.description);
    setEditValues(selectedKonvaCard.data.values);
    setShowEditPopup(true);
  };

  const handleFlip = async () => {
    if (socket && selectedKonvaCard) {
      const isFlipped = selectedKonvaCard.src.includes("FLIPPED.png");
      const cardUrl = isFlipped ? selectedKonvaCard.data?.originalCard : selectedKonvaCard.data?.originalCard || "http://localhost:3000/assets/FLIPPED.png";
      if (!cardUrl) {
        console.error("Original card URL not found.");
        return;
      }
      const img = new Image();
      img.src = cardUrl;
      img.onload = async () => {
        const aspectRatio = img.width / img.height;
        const width = 100;
        const height = isFlipped ? width / aspectRatio : width / 0.6; // Adjust aspect ratio based on flip state
        let newCardData = {};
        if (isFlipped) {
          if (selectedKonvaCard.data?.description || selectedKonvaCard.data?.values?.length || selectedKonvaCard.data?.additional?.length) {
            newCardData = {
              description: selectedKonvaCard.data.description,
              values: selectedKonvaCard.data.values,
              additional: selectedKonvaCard.data.additional,
            };
          } else {
            try {
              const response = await axios.get(cardUrl.replace(/\.(png|jpg|jpeg|PNG|JPG|JPEG)$/, ".json"));
              newCardData = response.data;
            } catch (error) {
              console.error("Error loading card data:", error);
              newCardData = { description: "", values: [], additional: [] };
            }
          }
        } else {
          newCardData = { ...selectedKonvaCard.data, originalCard: selectedKonvaCard.src };
        }
        const newCard = {
          x: selectedKonvaCard.x,
          y: selectedKonvaCard.y,
          width,
          height,
          image: img, // Ensure the image is set correctly
          src: cardUrl,
          data: newCardData,
        };
        const updatedImages = images.map((img) => (img === selectedKonvaCard ? newCard : img));
        setImages(updatedImages);
        socket.emit("updateImagePositions", { roomName, images: updatedImages });
        logAction({ player: username, action: "flipped a card", backgroundColor: "#d3d3d3" }); // Light grey background
        setSelectedKonvaCard(null);
        setPopupPosition(null); // Close the popup menu
      };
    }
  };

  const handleAdditional = () => {
    setShowAdditionalPopup(true);
  };

  const handlePlayAdditionalCard = (additionalCard: string) => {
    if (socket && selectedKonvaCard) {
      const mainCardUrl = selectedKonvaCard.src;
      const deckNameMatch = mainCardUrl.match(/\/decks\/([^/]+)\//);
      const deckName = deckNameMatch ? deckNameMatch[1] : null;

      let additionalCardUrl;
      if (additionalCard.startsWith("http://localhost:3000")) {
        additionalCardUrl = additionalCard;
      } else if (deckName) {
        additionalCardUrl = `http://localhost:3000/decks/${deckName}/additional/${additionalCard}`;
      } else {
        console.error("Deck name could not be determined from the main card URL.");
        return;
      }

      if (!additionalCardUrl) {
        console.error("Additional card URL is null or undefined.");
        return;
      }

      console.log("Playing additional card with URL:", additionalCardUrl); // Log the URL
      const img = new Image();
      img.src = additionalCardUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const width = 100;
        const height = width / aspectRatio;
        const data = {
          description: "",
          values: [],
          additional: []
        };
        socket.emit("playCard", { roomName, username, card: additionalCardUrl, width, height, data });
        logAction({ player: username, action: "added an additional card", backgroundColor: "#ffffe0" }); // Very light yellow background
      };
      setShowAdditionalPopup(false);
    }
  };

  const handleDiscard = () => {
    if (socket && selectedKonvaCard) {
      socket.emit("discardCard", { roomName, username, card: selectedKonvaCard.src });
      socket.emit("updateImagePositions", {
        roomName,
        images: images.filter((img) => img !== selectedKonvaCard),
      });
      setSelectedKonvaCard(null);
    }
  };

  const handleSaveEdit = async () => {
    if (socket && selectedKonvaCard) {
      const updatedCard = {
        ...selectedKonvaCard,
        data: {
          ...selectedKonvaCard.data,
          description: editDescription,
          values: editValues,
        },
      };
      setImages(images.map((img) => (img === selectedKonvaCard ? updatedCard : img)));
      socket.emit("updateImagePositions", { roomName, images: images.map((img) => (img === selectedKonvaCard ? updatedCard : img)) });

      try {
        await axios.post("http://localhost:3000/save-konva-card", {
          roomName,
          card: updatedCard,
        });
        console.log("Card data saved to server successfully.");
        logAction({ player: username, action: "edited a card", backgroundColor: "#ccffcc" }); // Lime green background
      } catch (error) {
        console.error("Error saving card data to server:", error);
      }

      setShowEditPopup(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(",").map((val) => {
      const num = parseFloat(val.trim());
      return isNaN(num) ? 0 : num;
    });
    setEditValues(values);
  };

  const [showDicePopup, setShowDicePopup] = useState(false);
  const [diceCount, setDiceCount] = useState(1);
  const [diceFaces, setDiceFaces] = useState(6);

  const handleDiceRoll = () => {
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceFaces) + 1);
    }
    const sum = rolls.reduce((acc, roll) => acc + roll, 0);
    const rollResult = rolls.length > 1 ? `${rolls.join(" + ")} = ${sum}` : rolls[0];
    const message = `rolled <b>${diceCount}d${diceFaces}</b>: ${rollResult}`;
    logAction({ player: username, action: message, backgroundColor: "#dda0dd" }); // Purple background
    setShowDicePopup(false);
  };

  const [showDeckListPopup, setShowDeckListPopup] = useState(false);
  const [availableDecks, setAvailableDecks] = useState<string[]>([]);

  const handleShuffleIn = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/decks`);
      const uniqueDecks = ["main", ...new Set((response.data.decks as string[]).filter((deck: string) => deck !== "main" && deck !== "discard"))];
      setAvailableDecks(uniqueDecks);
      setShowDeckListPopup(true);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  const handleShuffleInDeckSelect = async (deckName: string) => {
    if (socket && selectedKonvaCard) {
      const formattedCardUrl = selectedKonvaCard.src.startsWith("http://localhost:3000") ? selectedKonvaCard.src.replace("http://localhost:3000", "") : selectedKonvaCard.src;
      try {
        const response = await axios.post("http://localhost:3000/shuffle-in-card", {
          roomName,
          cardUrl: formattedCardUrl,
          deckName,
        });

        if (response.data.success) {
          const updatedImages = images.filter(img => img !== selectedKonvaCard);
          setImages(updatedImages);
          socket.emit("updateImagePositions", { roomName, images: updatedImages });
          logAction({ player: username, action: `shuffled a card into the <b>${deckName}</b> deck`, backgroundColor: "#ffcccc" }); // Very light red background
        } else {
          alert("Failed to shuffle card into deck.");
        }
      } catch (error) {
        console.error("Error shuffling card into deck:", error);
      } finally {
        setShowDeckListPopup(false);
        setSelectedKonvaCard(null);
      }
    }
  };

  const handleScoreChange = async (scoreName: string, playerName: string, newValue: number) => {
    if (socket) {
      try {
        const oldValue = scores[scoreName].find((player: any) => player.name === playerName).value;
        await axios.post("http://localhost:3000/update-score", { roomName, scoreName, playerName, newValue });
        logAction({
          player: username,
          action: `updated <b>${playerName}</b>'s <b>${scoreName}</b> from <b>${oldValue}</b> to <b>${newValue}</b>`,
          backgroundColor: "#ffb6c1", // Pink background
        });
        setScores((prevScores: any) => ({
          ...prevScores,
          [scoreName]: prevScores[scoreName].map((player: any) =>
            player.name === playerName ? { ...player, value: newValue } : player
          ),
        }));
        socket.emit("updateScores", { roomName, scores: { ...scores, [scoreName]: scores[scoreName].map((player: any) => player.name === playerName ? { ...player, value: newValue } : player) } });
      } catch (error) {
        console.error("Error updating score:", error);
      }
    }
  };

  const EditableCell = ({ value: initialValue, row: { original }, column: { id }, updateMyData }: any) => {
    const [value, setValue] = useState(initialValue);
  
    const onChange = (e: any) => {
      setValue(e.target.value);
    };
  
    const onBlur = () => {
      updateMyData(original.scoreName, id, value);
    };
  
    const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        updateMyData(original.scoreName, id, value);
      }
    };
  
    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);
  
    return <input value={value} onChange={onChange} onBlur={onBlur} onKeyPress={onKeyPress} style={styles.scoreInput} />;
  };
  
  const defaultColumn = {
    Cell: (props: any) => <EditableCell {...props} updateMyData={handleScoreChange} />,
  };
  
  const columns = React.useMemo(
    () => [
      {
        Header: 'Score Type',
        accessor: 'scoreName',
        Cell: ({ value }: any) => <span>{value}</span>, // Make score type names uneditable
      },
      ...(scores.Points ? scores.Points.map((player: any) => ({
        Header: player.name.length > 10 ? `${player.name.substring(0, 10)}...` : player.name,
        accessor: player.name,
      })) : []),
    ],
    [scores.Points]
  );
  
  const data = React.useMemo(
    () =>
      Object.keys(scores).map((scoreName) => ({
        scoreName,
        ...(scores[scoreName] ? scores[scoreName].reduce((acc: any, player: any) => {
          acc[player.name] = player.value;
          return acc;
        }, {}) : {}),
      })),
    [scores]
  );
  
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
    defaultColumn,
  });

  const handleScoresButtonClick = () => {
    setScoresVisible(!scoresVisible);
  };

  const handleEditButtonClick = () => {
    setEditMenuVisible(!editMenuVisible);
  };

  const handleAddScore = async () => {
    const scoreName = prompt("Enter the name of the new score:");
    const defaultValue = parseInt(prompt("Enter the default value for the new score:")||"", 10);

    if (scoreName && !isNaN(defaultValue)) {
      try {
        const response = await axios.post("http://localhost:3000/create-score", { roomName, scoreName, defaultValue });
        if (response.data.success) {
          setScores((prevScores: any) => ({
            ...prevScores,
            [scoreName]: prevScores.Points.map((player: any) => ({ name: player.name, value: defaultValue })),
          }));
          logAction({ player: username, action: `created a new score: <b>${scoreName}</b>`, backgroundColor: "#ffb6c1" }); // Pink background
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error creating score:", error);
      }
    }
  };

  const handleRemoveScore = async (scoreName: string) => {
    try {
      const response = await axios.post("http://localhost:3000/delete-score", { roomName, scoreName });
      if (response.data.success) {
        setScores((prevScores: any) => {
          const newScores = { ...prevScores };
          delete newScores[scoreName];
          return newScores;
        });
        logAction({ player: username, action: `removed the score: <b>${scoreName}</b>`, backgroundColor: "#ffb6c1" }); // Pink background
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting score:", error);
    }
  };

  const handlePlayersButtonClick = async () => {
    console.log("Fetching players for room:", roomName);
    try {
      const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/players`);
      console.log("Server response:", response.data);
      if (response.data.success) {
        setPlayers(response.data.players);
        setShowPlayersPopup(true);
        console.log("Players fetched successfully:", response.data.players);
      } else {
        alert("Failed to fetch players.");
        console.error("Failed to fetch players:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handlePlayerButtonClick = (player: string) => {
    setSelectedPlayer(player);
    setShowPlayerActionsPopup(true);
  };

  const handleViewCards = async () => {
    if (selectedPlayer) {
      const count = parseInt(prompt("Enter the number of cards to view:")||"", 10);
      if (count > 0) {
        setRevealLimit(count); // Save the reveal limit
        try {
          const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${selectedPlayer}`);
          const handUrls = response.data.hand.map((card: string) => `http://localhost:3000${card}`);
          setViewingCards(handUrls);
          setViewingCardIndices([]); // Initially, no cards are revealed
          setHandVisible(false);
          setShowPlayerActionsPopup(false);
          logAction({ player: username, action: `is viewing up to <b>${count}</b> cards from <b>${selectedPlayer}</b>`, backgroundColor: "#e6e6fa" }); // Light purple background
        } catch (error) {
          console.error("Error fetching player hand cards:", error);
        }
      }
    }
  };

  const handleStealCards = async () => {
    if (selectedPlayer) {
      try {
        const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${selectedPlayer}`);
        const handUrls = response.data.hand.map((card: string) => `http://localhost:3000${card}`);
        setStealCards(handUrls);
        setStealCardIndices([]); // Initially, no cards are revealed
        setHandVisible(false);
        setShowPlayerActionsPopup(false);
        setShowStealPopup(true);
        logAction({ player: username, action: `is attempting to steal a card from <b>${selectedPlayer}</b>`, backgroundColor: "#ffcccb" }); // Light red background
      } catch (error) {
        console.error("Error fetching player hand cards:", error);
      }
    }
  };

  const handleStealCard = (index: number) => {
    if (stealCardIndices.length === 0) {
      setStealCardIndices([index]);
    }
  };

  const confirmStealCard = () => {
    if (stealCardIndices.length > 0 && socket) { // Add null check for socket
      const cardIndex = stealCardIndices[0];
      socket.emit("stealCard", { roomName, thief: username, victim: selectedPlayer, cardIndex });
      setShowStealPopup(false);
      logAction({ player: username, action: `stole a card from <b>${selectedPlayer}</b>`, backgroundColor: "#ff9999" }); // Light red background
    }
  };

  const handleClosePlayerActionsPopup = () => {
    setShowPlayerActionsPopup(false);
  };

  const handleToHand = async () => {
    if (socket && selectedKonvaCard) {
      try {
        const formattedCardUrl = selectedKonvaCard.src.startsWith("http://localhost:3000") ? selectedKonvaCard.src.replace("http://localhost:3000", "") : selectedKonvaCard.src;
        const response = await axios.post("http://localhost:3000/add-card-to-hand", {
          roomName,
          username,
          cardUrl: formattedCardUrl,
        });

        if (response.data.success) {
          const updatedImages = images.filter(img => img !== selectedKonvaCard);
          setImages(updatedImages);
          socket.emit("updateImagePositions", { roomName, images: updatedImages });
          logAction({ player: username, action: "added a card to hand", backgroundColor: "#ccffcc" }); // Light green background
        } else {
          alert("Failed to add card to hand.");
        }
      } catch (error) {
        console.error("Error adding card to hand:", error);
      } finally {
        setSelectedKonvaCard(null);
      }
    }
  };

  const handleSettingsButtonClick = () => {
    setShowSettingsPopup(!showSettingsPopup);
  };

  const handleCountCards = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/lobbies/${roomName}/players`);
      if (response.data.success) {
        const players = response.data.players;
        const cardCounts: { [key: string]: number } = {};
        for (const player of players) {
          const handResponse = await axios.get(`http://localhost:3000/lobbies/${roomName}/hands/${player}`);
          cardCounts[player] = handResponse.data.hand.length;
        }
        setPlayerCardCounts(cardCounts);
        setShowCardCountPopup(true); // Show the card count popup
      } else {
        alert("Failed to fetch players.");
      }
    } catch (error) {
      console.error("Error counting cards:", error);
    }
  };

  const handleCookieClick = () => {
    if (players.length > 0) {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      logAction({
        player: "",
        action: `I CHOOSE: <b>${randomPlayer}</b>`,
        backgroundColor: "#dda0dd", // Purple background
      });
    }
  };

  return (
    <>
      <div style={styles.scoresContainer}>
        <div style={styles.scoresButtonContainer}>
          <button style={styles.scoresButton} onClick={handleScoresButtonClick}>
            {scoresVisible ? "Hide Scores" : "Show Scores"}
          </button>
          <button style={styles.scoresButton} onClick={handleEditButtonClick}>
            EDIT
          </button>
        </div>
        {editMenuVisible && (
          <div style={styles.editMenu}>
            <button style={styles.editMenuItem} onClick={() => setShowAddScorePopup(true)}>Add Score</button>
            <button style={styles.editMenuItem} onClick={() => setShowRemoveScorePopup(true)}>Remove Score</button>
          </div>
        )}
        {scoresVisible && (
          <table {...getTableProps()} style={styles.scoresTable}>
            <thead>
              {headerGroups.map((headerGroup: any) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column: any) => (
                    <th {...column.getHeaderProps()} style={styles.tableHeader}>{column.render('Header')}</th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row: any) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell: any) => (
                      <td {...cell.getCellProps()} style={styles.tableCell}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {showAddScorePopup && (
        <div style={styles.popup}>
          <h3>Add Score</h3>
          <button style={styles.popupButton} onClick={handleAddScore}>Add Score</button>
          <button style={styles.popupButton} onClick={() => setShowAddScorePopup(false)}>Cancel</button>
        </div>
      )}
      {showRemoveScorePopup && (
        <div style={styles.popup}>
          <h3>Remove Score</h3>
          {Object.keys(scores).map((scoreName, index) => (
            <button key={index} style={styles.popupButton} onClick={() => handleRemoveScore(scoreName)}>
              {scoreName}
            </button>
          ))}
          <button style={styles.popupButton} onClick={() => setShowRemoveScorePopup(false)}>Cancel</button>
        </div>
      )}
      <Stage width={window.innerWidth} height={window.innerHeight} onClick={handleCanvasClick}>
        <Layer>
          {images.map((img, index) => (
            <React.Fragment key={index}>
              <KonvaImage
                x={img.x}
                y={img.y}
                width={img.width}
                height={img.height}
                image={img.image}
                draggable
                onDragEnd={(e) => handleImageDragEnd(e, index)}
                onClick={(e) => handleKonvaCardClick(img, e)}
              />
              {!img.src.includes("FLIPPED.png") && img.data && img.data.values && img.data.values.length > 0 && (
                img.data.values.map((value: number, valueIndex: number) => {
                  const valuesPerRow = 3; // Ensure rows of 3 values
                  const rowIndex = Math.floor(valueIndex / valuesPerRow);
                  const colIndex = valueIndex % valuesPerRow;
                  const totalValues = img.data.values.length;
                  const valuesInCurrentRow = Math.min(valuesPerRow, totalValues - rowIndex * valuesPerRow);
                  let xPosition;
                  if (valuesInCurrentRow === 1) {
                    xPosition = img.x + img.width / 2 + 50;
                  } else if (valuesInCurrentRow === 2) {
                    xPosition = img.x + (colIndex === 0 ? img.width / 4 + 25 : (3 * img.width) / 4 + 60);
                  } else if (valuesInCurrentRow === 3) {
                    xPosition = img.x + (colIndex === 0 ? img.width / 4 + 25 : colIndex === 1 ? img.width / 2 + 40 : (3 * img.width) / 4 + 60);
                  } else {
                    xPosition = img.x + ((colIndex + 1) * img.width) / (valuesInCurrentRow + 1) + 50;
                  }
                  return (
                    <Text
                      key={valueIndex}
                      x={xPosition - img.width / 2}
                      y={img.y - 20 - rowIndex * 20} // Position above the card, spaced out equally
                      text={value.toString()}
                      fontSize={14} // Make the values a little bigger
                      fontStyle="bold" // Make the values bold
                      fill="black"
                    />
                  );
                })
              )}
            </React.Fragment>
          ))}
        </Layer>
      </Stage>
      {isHost && (
        <button style={{ ...styles.settingsButton, zIndex: 2000 }} onClick={handleSettingsButtonClick}>
          ⚙️
        </button>
      )}
      {showSettingsPopup && (
        <div style={styles.settingsPopup}>
          <h3>Game Settings</h3>
          {/* Add your settings controls here */}
          <button style={styles.popupButton} onClick={() => setShowSettingsPopup(false)}>Close</button>
        </div>
      )}
      <button style={{ ...styles.diceToggleButton, zIndex: 2000 }} onClick={() => setShowDicePopup(!showDicePopup)}>
        🎲
      </button>
      <button style={{ ...styles.chatToggleButton, zIndex: 2000 }} onClick={() => setChatVisible(!chatVisible)}>
        <FaComments />
      </button>
      {chatVisible && (
        <img
          src="http://localhost:3000/assets/COOKIE.png"
          alt="Cookie"
          style={styles.cookieImage}
          onClick={handleCookieClick}
          onMouseEnter={(e) => (e.currentTarget.style.transform = styles.cookieImageHover.transform || 'scale(1.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      )}
      {showDicePopup && (
        <div
          style={{
            ...styles.dicePopup,
            right: chatVisible ? '370px' : '10px', // Move dice popup to the left of the chat if chat is visible
          }}
        >
          <div style={styles.diceInputContainer}>
            <input
              type="number"
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value, 10))}
              style={styles.diceInput}
            />
            <span style={styles.diceSeparator}>d</span>
            <input
              type="number"
              value={diceFaces}
              onChange={(e) => setDiceFaces(parseInt(e.target.value, 10))}
              style={styles.diceInput}
            />
          </div>
          <button style={styles.popupButton} onClick={handleDiceRoll}>ROLL</button>
        </div>
      )}
      {selectedKonvaCard && popupPosition && (
        <div style={{ ...styles.popupMenu, top: popupPosition.y, left: popupPosition.x }}>
          {selectedKonvaCard.data?.originalCard ? (
            <button style={styles.popupButton} onClick={handleFlip}>FLIP</button>
          ) : (
            <>
              <button style={styles.popupButton} onClick={handleInspect}>INSPECT</button>
              <button style={styles.popupButton} onClick={handleEdit}>EDIT</button>
              <button style={styles.popupButton} onClick={handleFlip}>FLIP</button>
              <button style={styles.popupButton} onClick={handleAdditional}>ADDITIONAL</button>
              <button style={styles.popupButton} onClick={handleShuffleIn}>SHUFFLE IN</button>
              <button style={styles.popupButton} onClick={handleToHand}>TO HAND</button> {/* New button */}
              <button style={styles.popupButton} onClick={handleDiscard}>DISCARD</button>
            </>
          )}
        </div>
      )}
      {showDeckListPopup && (
        <div style={styles.deckListPopup}>
          <h3>Select a Deck</h3>
          <div style={styles.deckListContainer}>
            {availableDecks.map((deck, index) => (
              <button key={index} style={styles.deckListButton} onClick={() => handleShuffleInDeckSelect(deck)}>
                {deck}
              </button>
            ))}
          </div>
          <button style={styles.popupButton} onClick={() => setShowDeckListPopup(false)}>Cancel</button>
        </div>
      )}
      {showInspectPopup && selectedKonvaCard && (
        <div style={styles.inspectPopup}>
          <img src={selectedKonvaCard.src} alt="Card" style={styles.inspectImage} />
          <p>{selectedKonvaCard.data?.description}</p>
          <button style={styles.popupButton} onClick={() => setShowInspectPopup(false)}>Close</button>
        </div>
      )}
      {showEditPopup && selectedKonvaCard && (
        <div style={styles.editPopup}>
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            style={styles.editTextarea}
          />
          <input
            type="text"
            value={editValues.join(", ")}
            onChange={handleEditInputChange}
            style={styles.editInput}
          />
          <button style={styles.popupButton} onClick={handleSaveEdit}>Save</button>
          <button style={styles.popupButton} onClick={() => setShowEditPopup(false)}>Cancel</button>
        </div>
      )}
      {showAdditionalPopup && selectedKonvaCard && (
        <div style={styles.additionalPopup}>
          <div style={styles.additionalCardContainer}>
            <img
              src={selectedKonvaCard.src}
              alt="Duplicate Card"
              style={styles.additionalCard}
              onClick={() => handlePlayAdditionalCard(selectedKonvaCard.src)}
            />
            {selectedKonvaCard.data?.additional?.map((additionalCard: string, index: number) => {
              const mainCardUrl = selectedKonvaCard.src;
              const deckNameMatch = mainCardUrl.match(/\/decks\/([^/]+)\//);
              const deckName = deckNameMatch ? deckNameMatch[1] : null;
              const additionalCardUrl = deckName ? `http://localhost:3000/decks/${deckName}/additional/${additionalCard}` : null;

              if (!additionalCardUrl) {
                console.error("Additional card URL could not be determined.");
                return null;
              }

              return (
                <img
                  key={index}
                  src={additionalCardUrl}
                  alt={`Additional Card ${index}`}
                  style={styles.additionalCard}
                  onClick={() => handlePlayAdditionalCard(additionalCard)}
                />
              );
            })}
          </div>
          <button style={styles.popupButton} onClick={() => setShowAdditionalPopup(false)}>Close</button>
        </div>
      )}
      {showPeekPopup && (
        <div style={styles.peekPopup}>
          <div style={styles.peekContent}>
            {peekCards.map((card, index) => (
              <img key={index} src={card} alt={`Peeked Card ${index}`} style={styles.peekCard} />
            ))}
          </div>
          <button style={styles.popupButton} onClick={() => setShowPeekPopup(false)}>Close</button>
        </div>
      )}
      <div style={styles.buttonContainer}>
        <button
          ref={deckButtonRef}
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleDeckButtonClick}
        >
          Deck
        </button>
        <button
          style={styles.handButton}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleHandButtonClick}
        >
          HAND
        </button>
        <button
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handlePlayersButtonClick}
        >
          PLAYERS
        </button>
        <button
          ref={additionalDeckButtonRef}
          style={styles.button}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor || '')}
onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = styles.button.backgroundColor || '')}
          onClick={handleAdditionalDeckButtonClick}
        >
          Additional Decks
        </button>
      </div>
      {deckMenuVisible && deckButtonRef.current && (
        <div
          style={{
            ...styles.deckMenu,
            left: `${deckButtonRef.current.getBoundingClientRect().left}px`,
            width: `${deckButtonRef.current.getBoundingClientRect().width - 5}px`, // Increase the width by 2 px
          }}
        >
          <button style={styles.deckMenuItem} onClick={() => handleDeckMenuOptionClick("Peek")}>Peek</button>
          <button style={styles.deckMenuItem} onClick={() => handleDeckMenuOptionClick("To Field")}>To Field</button>
          <button style={styles.deckMenuItem} onClick={() => handleDeckMenuOptionClick("Deal")}>Deal</button>
          <button style={styles.deckMenuItem} onClick={() => handleDeckMenuOptionClick("Draw")}>Draw</button>
        </div>
      )}
      {additionalDeckMenuVisible && additionalDeckButtonRef.current && (
        <div
          style={{
            ...styles.deckMenu,
            left: `${additionalDeckButtonRef.current.getBoundingClientRect().left}px`,
            width: `${additionalDeckButtonRef.current.getBoundingClientRect().width - 5}px`, // Increase the width by 2 px
          }}
        >
          {availableDecks.map((deck, index) => (
            <div key={index} style={styles.additionalDeckMenuItem}>
              <button style={styles.deckMenuItem} onClick={() => setSelectedAdditionalDeck(deck)}>
                {deck}
              </button>
              {selectedAdditionalDeck === deck && (
                <div style={{ ...styles.subDeckMenu }}>
                  <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick(deck, "Peek")}>Peek</button>
                  <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick(deck, "To Field")}>To Field</button>
                  <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick(deck, "Deal")}>Deal</button>
                  <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick(deck, "Draw")}>Draw</button>
                </div>
              )}
            </div>
          ))}
          <div style={styles.additionalDeckMenuItem}>
            <button style={styles.deckMenuItem} onClick={() => setSelectedAdditionalDeck("discard")}>Discard</button>
            {selectedAdditionalDeck === "discard" && (
              <div style={{ ...styles.subDeckMenu }}>
                <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick("discard", "Peek")}>Peek</button>
                <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick("discard", "To Field")}>To Field</button>
                <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick("discard", "Deal")}>Deal</button>
                <button style={styles.deckMenuItem} onClick={() => handleAdditionalDeckMenuOptionClick("discard", "Draw")}>Draw</button>
              </div>
            )}
          </div>
        </div>
      )}
      {chatVisible && (
        <div style={styles.chatContainer}>
          <div style={styles.chatMessages}>
            {messages.map((msg, index) => (
              <div key={index} style={styles.chatMessage} dangerouslySetInnerHTML={{ __html: msg }}></div>
            ))}
          </div>
          <div style={styles.chatInputContainer}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={styles.chatInput}
              placeholder="Type a message..."
            />
            <button onClick={handleSendMessage} style={styles.sendButton}>Send</button>
          </div>
        </div>
      )}
      {handVisible && (
        <div
          ref={handContainerRef}
          style={styles.handContainer}
          onMouseDown={handleHandMouseDown}
          onWheel={handleHandWheel}
          onClick={handleCancel} // Hide buttons if background is clicked
        >
          <div style={styles.handContent}>
            {handCards.map((card, index) => (
              <div key={index} style={styles.cardContainer} onClick={(e) => { e.stopPropagation(); handleHandCardClick(card, index); }}>
                <img src={card} alt={`Card ${index}`} style={styles.handCard} />
                {selectedCard === card && selectedCardIndex === index && (
                  <div style={styles.cardOptions}>
                    {cardOptions.includes("PLAY") && <button style={styles.cardOptionButton} onClick={handlePlayCard}>PLAY</button>}
                    {cardOptions.includes("PLAY FLIPPED") && <button style={styles.cardOptionButton} onClick={handlePlayFlippedCard}>PLAY FLIPPED</button>}
                    {cardOptions.includes("DISCARD") && <button style={styles.cardOptionButton} onClick={handleDiscardCard}>DISCARD</button>}
                    {cardOptions.includes("UPLOAD") && <button style={styles.cardOptionButton} onClick={handleUploadCard}>UPLOAD</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {showPlayersPopup && (
        <div style={styles.popup}>
          <h3>Players in Lobby</h3>
          <ul>
            {players.map((player, index) => (
              <li key={index} style={styles.playerListItem}>
                <span>{player.length > 15 ? `${player.substring(0, 15)}...` : player}</span>
                <div style={styles.playerActionsContainer}>
                  <button style={styles.popupButton} onClick={() => handlePlayerButtonClick(player)}>Actions</button>
                </div>
              </li>
            ))}
          </ul>
          <button style={styles.popupButton} onClick={handleCountCards}>Count Cards</button> {/* New button */}
          <button style={styles.popupButton} onClick={() => setShowPlayersPopup(false)}>Close</button>
        </div>
      )}
      {showPlayerActionsPopup && selectedPlayer && (
        <div style={styles.popup}>
          <h3>Actions for {selectedPlayer}</h3>
          <button style={styles.popupButton} onClick={handleViewCards}>View Cards</button>
          <button style={styles.popupButton} onClick={handleStealCards}>Steal Cards</button>
          <button style={styles.popupButton} onClick={handleClosePlayerActionsPopup}>Close</button>
        </div>
      )}
      {viewingCards.length > 0 && (
        <div style={styles.viewingContainer}>
          {viewingCards.map((card, index) => (
            <div key={index} style={styles.viewingCard} onClick={() => handleRevealCard(index)}>
              {viewingCardIndices.includes(index) ? (
                <img src={card} alt={`Card ${index}`} style={styles.viewingCardImage} />
              ) : (
                <div style={styles.viewingCardPlaceholder}></div>
              )}
            </div>
          ))}
          <button style={styles.popupButton} onClick={() => setViewingCards([])}>Close</button>
        </div>
      )}
      {showStealPopup && (
        <div style={styles.stealPopup}>
          <h3>Select a Card to Steal</h3>
          <div style={styles.stealContent}>
            {stealCards.map((card, index) => (
              <div key={index} style={styles.stealCard} onClick={() => handleStealCard(index)}>
                {stealCardIndices.includes(index) ? (
                  <div style={styles.stealCardSelected}>Selected</div>
                ) : (
                  <div style={styles.stealCardPlaceholder}></div>
                )}
              </div>
            ))}
          </div>
          <button style={styles.popupButton} onClick={confirmStealCard}>Confirm Steal</button>
          <button style={styles.popupButton} onClick={() => setShowStealPopup(false)}>Cancel</button>
        </div>
      )}
      {showCardCountPopup && (
        <div style={styles.cardCountPopup}>
          <h3>Card Counts</h3>
          <table style={styles.cardCountTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Player</th>
                <th style={styles.tableHeader}>Card Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(playerCardCounts).map(([player, count], index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{player}</td>
                  <td style={styles.tableCell}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={styles.popupButton} onClick={() => setShowCardCountPopup(false)}>Close</button>
        </div>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: '10px 40px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    fontWeight: 'bold',
  },
  handButton: {
    padding: '10px 60px',
    fontSize: '1.5rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    fontWeight: 'bold',
  },
  buttonHover: {
    backgroundColor: '#ccc',
  },
  chatToggleButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '8px', // Reduce the height of the chat button
    fontSize: '1.5rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    zIndex: 2000,
  },
  diceToggleButton: {
    position: 'absolute',
    top: '10px',
    right: '60px', // Adjusted to place it to the left of the chat button
    padding: '8px',
    fontSize: '1.5rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    zIndex: 2000,
  },
  chatContainer: {
    position: 'absolute',
    top: '50px',
    right: '10px',
    width: '350px', // Increase the width of the chat popup
    height: '600px', // Increase the height of the chat popup
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: 3000, // Increase z-index
  },
  chatMessages: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
  },
  chatMessage: {
    marginBottom: '10px',
    fontFamily: 'Consolas, monospace',
  },
  chatInputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '2px solid #000',
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    fontSize: '1rem',
    border: '2px solid #000',
    borderRadius: '5px',
    fontFamily: 'Consolas, monospace',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    marginLeft: '10px',
  },
  deckMenu: {
    position: 'absolute',
    bottom: '60px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
  deckMenuItem: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderBottom: '1px solid #000',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    fontWeight: 'bold',
  },
  handContainer: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    overflowX: 'scroll', // Ensure horizontal scrolling
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  handContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: 'max-content', // Ensure the content width adjusts to fit all cards
    minWidth: '100%', // Ensure the content width is at least 100% of the container
  },
  handCard: {
    width: '500px', // Increase width
    height: 'auto', // Maintain aspect ratio
    margin: '10px',
  },
  cardContainer: {
    position: 'relative',
  },
  cardOptions: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    zIndex: 1000,
    padding: '10px', // Increase padding
  },
  cardOptionButton: {
    padding: '10px 20px', // Increase padding
    fontSize: '1rem', // Increase font size
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    margin: '5px 0', // Increase margin
  },
  popupMenu: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '10px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  popupButton: {
    padding: '10px 20px',
    margin: '5px 0',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
  },
  inspectPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '40px', // Increase padding
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 'auto', // Adjust width to fit the image
    maxHeight: '70%', // Decrease the maximum height to ensure the close button is in frame
  },
  inspectImage: {
    width: 'auto',
    height: 'auto',
    maxWidth: 'calc(4/7 * 100vw)', // Ensure the image width does not exceed 4/7 of the viewport width
    maxHeight: 'calc(4/7 * 100vh)', // Ensure the image height does not exceed 4/7 of the viewport height
    marginBottom: '20px', // Increase margin
  },
  editPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  editTextarea: {
    width: '300px',
    height: '100px',
    marginBottom: '10px',
    padding: '10px',
    fontSize: '1rem',
    border: '2px solid #000',
    borderRadius: '5px',
    fontFamily: 'Consolas, monospace',
  },
  editInput: {
    width: '300px',
    marginBottom: '10px',
    padding: '10px',
    fontSize: '1rem',
    border: '2px solid #000',
    borderRadius: '5px',
    fontFamily: 'Consolas, monospace',
  },
  additionalPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '50%', // Reduce the height
    overflowY: 'auto', // Allow vertical scrolling
  },
  additionalCardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '80%', // Reduce the height of the container
    overflowY: 'auto', // Allow vertical scrolling
  },
  additionalCard: {
    width: '100px',
    height: 'auto',
    margin: '10px',
    cursor: 'pointer',
  },
  dicePopup: {
    position: 'absolute',
    top: '100px',
    right: '10px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 3000, // Increase z-index
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  diceInputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  diceInput: {
    width: '50px',
    padding: '5px',
    fontSize: '1rem',
    border: '2px solid #000',
    borderRadius: '5px',
    margin: '5px',
    textAlign: 'center',
  },
  diceSeparator: {
    fontSize: '1.5rem',
    margin: '0 10px',
  },
  deckListPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '50%',
    overflowY: 'auto',
  },
  deckListContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '80%',
    overflowY: 'auto',
  },
  deckListButton: {
    padding: '10px 20px',
    margin: '5px 0',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
  },
  peekPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '50%',
    overflowY: 'auto',
  },
  peekContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: '80%',
    overflowY: 'auto',
  },
  peekCard: {
    width: '200px', // Increase width
    height: 'auto',
    margin: '10px',
  },
  additionalDeckMenuItem: {
    position: 'relative',
  },
  subDeckMenu: {
    position: 'fixed', // Change to fixed to ensure it's always centered
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Center horizontally and vertically
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    width: 'auto', // Ensure the width adjusts to fit the content
    maxWidth: '90%', // Ensure the popup does not exceed 90% of the viewport width
    maxHeight: '90%', // Ensure the popup does not exceed 90% of the viewport height
    overflowY: 'auto', // Allow vertical scrolling if content exceeds max height
  },
  scoresContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 1000,
  },
  scoresButton: {
    marginBottom: '10px',
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
  },
  scoresTable: {
    width: 'auto',
    borderCollapse: 'collapse',
    textAlign: 'center',
  },
  tableHeader: {
    borderBottom: '2px solid #000',
    padding: '5px',
    textAlign: 'center',
  },
  tableCell: {
    borderBottom: '1px solid #000',
    padding: '5px',
    textAlign: 'center',
    borderRight: '1px solid #ccc', // Faint vertical dividing lines
  },
  scoreInput: {
    width: '50px',
    textAlign: 'center',
    border: '1px solid #000',
    borderRadius: '5px',
    padding: '5px',
  },
  scoreCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  createScorePopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  deleteScorePopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoresButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editMenu: {
    position: 'absolute',
    top: '50px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
  },
  editMenuItem: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderBottom: '1px solid #000',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    fontWeight: 'bold',
  },
  popup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  playerListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  playerActionsContainer: {
    marginLeft: '10px', // Add gap between player name and action button
  },
  viewingContainer: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '80%',
    height: '80%',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '5px',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  viewingCard: {
    width: '150px',
    height: '200px',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: '1px solid #000',
    borderRadius: '5px',
    backgroundColor: '#fff',
  },
  viewingCardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  viewingCardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  stealPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxHeight: '50%',
    overflowY: 'auto',
  },
  stealContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    maxHeight: '80%',
    overflowY: 'auto',
  },
  stealCard: {
    width: '150px',
    height: '200px',
    margin: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: '1px solid #000',
    borderRadius: '5px',
    backgroundColor: '#fff',
  },
  stealCardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  stealCardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc',
  },
  stealCardSelected: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  settingsButton: {
    position: 'absolute',
    top: '10px',
    right: '110px', // Adjusted to place it to the left of the dice button
    padding: '8px',
    fontSize: '1.5rem',
    backgroundColor: '#fff',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    fontFamily: 'Consolas, monospace',
    zIndex: 2000,
  },
  settingsPopup: {
    position: 'absolute',
    top: '100px',
    right: '10px',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 3000, // Increase z-index
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardCountPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    border: '2px solid #000',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  cardCountTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  cookieImage: {
    position: 'absolute',
    top: '660px', // Adjust the position as needed
    right: '10px',
    width: '100px',
    height: '100px',
    cursor: 'pointer',
    transition: 'transform 0.3s',
    zIndex: 2000,
  },
  cookieImageHover: {
    transform: 'scale(1.2)',
  },
};

export default Game;