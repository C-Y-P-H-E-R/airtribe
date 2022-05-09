import React, { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import uuid from "uuid/v4";
import "./styles.css";
import { MdAdd } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

const itemsFromBackend = [
  { id: uuid(), content: "Card 1" },
  { id: uuid(), content: "Card 2" },
  { id: uuid(), content: "Card 3" },
  { id: uuid(), content: "Card 4" },
  { id: uuid(), content: "Card 5" }
];

const columnsFromBackend = {
  Req: {
    name: "Not Started",
    items: itemsFromBackend
  },
  In: {
    name: "In Progress",
    items: []
  },
  Done: {
    name: "Completed",
    items: []
  }
};

const colors = {
    red: "rgba(226, 23, 23, 0.4)",
    green: "rgba(28, 141, 115, 0.4)",
    yellow: "rgba(247, 205, 46, 0.4)",
    white: "rgba(255, 255, 255, 0.4)"
  }

const color = (name) => {
  switch (name) {
    case "Not Started":
      return colors["red"];
    case "In Progress":
      return colors["yellow"];
    case "Completed":
      return colors["green"];
    default:
      return colors["white"];
  }
}

function App() {
  const [columns, setColumns] = useState(columnsFromBackend);

  const getFromLocalStorage = () => {
      return JSON.parse(localStorage.getItem('columns'));
    }

  const setOnLocalStorage = (value) => {
    localStorage.setItem('columns', JSON.stringify(value));
  }

  useEffect(() => {
    if(getFromLocalStorage() === null) {
      setOnLocalStorage(columns);
    }else{
      setColumns(getFromLocalStorage());
    }
  }, []);

  const handleNewColumn = (columnName) => {
    let newColumns = { ...columns };
    newColumns[columnName].items = [];
    setColumns(newColumns);
    setOnLocalStorage(newColumns);
  }

  const handleClick = (nm) => {
    const newColumns = { ...columns };
    if (columns["Req"].name === nm) {
      newColumns["Req"].items.push({
        id: uuid(),
        content: `Card ${columns["Req"].items.length + 1}`
      });
    } else if (columns["In"].name === nm) {
      newColumns["In"].items.push({
        id: uuid(),
        content: `Card ${columns["In"].items.length + 1}`
      });

    } else {
      newColumns["Done"].items.push({
        id: uuid(),
        content: `Card ${columns["Done"].items.length + 1}`
      });
    }
    setColumns(newColumns);
    setOnLocalStorage(newColumns);
  }

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const newColumns = { ...columns };

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      newColumns[source.droppableId].items = sourceItems;
      newColumns[destination.droppableId].items = destItems;
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      newColumns[source.droppableId].items = copiedItems;
    }
    setColumns(newColumns);
    setOnLocalStorage(newColumns);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
              key={columnId}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "94%"
                }}
              >
                <div
                    className="font_correction"
                    style={{display: "flex",
                      alignItems: "center"
                    }}
                  >
                  <h2
                    className={`header ${
                      column.name === "Not Started"
                        ? "req_back"
                        : column.name === "In Progress"
                        ? "in_back"
                        : "done_back"
                    }`}
                    style={{ paddingLeft: "6px",
                      width: '105px'
                    }}
                  >
                    {`${column.name} : `}
                  </h2>
                  <div
                      style={{
                        background: "white",
                        color: "#c1c1c1",
                        fontWeight: "bold",
                        display: "inline-block",
                        padding: "6px",
                      }}
                    >
                      {`${column.items?.length}`}
                    </div>
                </div>
                <div style={{ paddingRight: "0.5rem" }}>
                  <BsThreeDots color={"#c1c1c1"} size={20} />
                  <MdAdd
                    color={"#c1c1c1"}
                    style={{
                      marginLeft: "6px"
                    }}
                    size={20}
                    onClick={() => handleNewColumn(columnId)}
                  />
                </div>
              </div>
              <div style={{ margin: 8 }}>
                <Droppable droppableId={columnId} key={columnId}>
                  {(provided, snapshot) => {
                    return (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver
                            ? `${color(column.name)}`
                            : "white",
                          padding: 4,
                          width: 250,
                          minHeight: 500
                        }}
                      >
                        {column.items?.map((item, index) => {
                          return (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => {
                                return (
                                  <div
                                    className="todo"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: "none",
                                      padding: 16,
                                      margin: "0 0 8px 0",
                                      minHeight: "50px",
                                      backgroundColor: snapshot.isDragging
                                        ? "white"
                                        : "white",
                                      color: "#1C1C1C",
                                      ...provided.draggableProps.style
                                    }}
                                  >
                                    {item.content}
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        <div
                          className="todo addtodo"
                          onClick={() => handleClick(column.name)}
                          style={{
                            width: "87%",
                            padding: 16,
                            minHeight: "50px",
                            color: "#a1a1a1",
                            border: "none"
                          }}
                        >
                          + NEW
                        </div>
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}

export default App;
