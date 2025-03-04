import React, { useEffect, useState, useRef } from "react";
import { Button, Radio, Space, Input, Slider, Tooltip, message } from "antd";
import { 
  FormOutlined, 
  ClearOutlined, 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined,
  LineOutlined,
  BorderOuterOutlined,
  FontSizeOutlined,
  PictureOutlined,
  DownloadOutlined
} from "@ant-design/icons";

const EnhancedDrawingCanvas = ({ onSave, initialImage }) => {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [lineWidth, setLineWidth] = useState(3);
  const [lineColor, setLineColor] = useState("#000000");
  const [opacity, setOpacity] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  
  // For shapes
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const previewCanvasRef = useRef(null);
  const previewCtxRef = useRef(null);
  
  // For text
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [textMode, setTextMode] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  
  // For auto-saving
  const isCanvasModified = useRef(false);
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    setCtx(context);
    
    // Set canvas background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load initial image if provided
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = initialImage;
    } else {
      saveToHistory();
    }
    
    // Setup preview canvas for shapes
    const previewCanvas = previewCanvasRef.current;
    previewCtxRef.current = previewCanvas.getContext("2d");
    
    // Set initial font settings
    if (context) {
      context.font = `${fontSize}px ${fontFamily}`;
      context.textBaseline = "top";
    }
    
    // Setup auto-save timer
    autoSaveTimerRef.current = setInterval(() => {
      if (isCanvasModified.current) {
        autoSaveCanvas();
        isCanvasModified.current = false;
      }
    }, 3000); // Auto-save every 3 seconds if modified
    
    // Clean up on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [initialImage, backgroundColor]);

  // Update font when size or family changes
  useEffect(() => {
    if (ctx) {
      ctx.font = `${fontSize}px ${fontFamily}`;
    }
  }, [fontSize, fontFamily, ctx]);

  const saveToHistory = () => {
    // Remove any forward history if we're in the middle of history
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    
    // Save current state to history
    const imageData = canvasRef.current.toDataURL("image/png");
    historyRef.current.push(imageData);
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history size to prevent memory issues
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
    
    // Mark canvas as modified for auto-save
    isCanvasModified.current = true;
  };

  const autoSaveCanvas = () => {
    if (!canvasRef.current) return;
    
    const imageData = canvasRef.current.toDataURL("image/png");
    if (onSave && typeof onSave === 'function') {
      onSave(imageData);
    }
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      loadFromHistory();
      isCanvasModified.current = true;
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      loadFromHistory();
      isCanvasModified.current = true;
    }
  };

  const loadFromHistory = () => {
    const imageData = historyRef.current[historyIndexRef.current];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  };

  const startDrawing = (e) => {
    if (textMode) {
      // Handle text placement
      const { offsetX, offsetY } = getCoordinates(e);
      setTextPosition({ x: offsetX, y: offsetY });
      return;
    }
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (["rectangle", "circle", "line"].includes(tool)) {
      setStartPoint({ x: offsetX, y: offsetY });
      // Clear preview canvas
      const previewCanvas = previewCanvasRef.current;
      previewCtxRef.current.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    } else {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
    }
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = getCoordinates(e);
    
    if (["rectangle", "circle", "line"].includes(tool)) {
      // Draw preview on the overlay canvas
      drawShapePreview(offsetX, offsetY);
    } else if (tool === "pen") {
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = opacity / 100;
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.lineTo(offsetX, offsetY);
      ctx.strokeStyle = backgroundColor;
      ctx.lineWidth = lineWidth * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = 1; // Eraser is always 100% opacity
      ctx.stroke();
    }
  };

  const drawShapePreview = (currentX, currentY) => {
    const previewCtx = previewCtxRef.current;
    previewCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    
    previewCtx.strokeStyle = lineColor;
    previewCtx.lineWidth = lineWidth;
    previewCtx.globalAlpha = opacity / 100;
    previewCtx.beginPath();
    
    if (tool === "rectangle") {
      previewCtx.rect(
        startPoint.x, 
        startPoint.y, 
        currentX - startPoint.x, 
        currentY - startPoint.y
      );
    } else if (tool === "circle") {
      // Calculate radius based on distance
      const radius = Math.sqrt(
        Math.pow(currentX - startPoint.x, 2) + 
        Math.pow(currentY - startPoint.y, 2)
      );
      previewCtx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
    } else if (tool === "line") {
      previewCtx.moveTo(startPoint.x, startPoint.y);
      previewCtx.lineTo(currentX, currentY);
    }
    
    previewCtx.stroke();
  };

  const finalizeShape = (offsetX, offsetY) => {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity / 100;
    ctx.beginPath();
    
    if (tool === "rectangle") {
      ctx.rect(
        startPoint.x, 
        startPoint.y, 
        offsetX - startPoint.x, 
        offsetY - startPoint.y
      );
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(offsetX - startPoint.x, 2) + 
        Math.pow(offsetY - startPoint.y, 2)
      );
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
    } else if (tool === "line") {
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(offsetX, offsetY);
    }
    
    ctx.stroke();
    
    // Clear preview canvas
    previewCtxRef.current.clearRect(
      0, 0, 
      previewCanvasRef.current.width, 
      previewCanvasRef.current.height
    );
    
    saveToHistory();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    if (["rectangle", "circle", "line"].includes(tool)) {
      const { offsetX, offsetY } = getCoordinates(e);
      finalizeShape(offsetX, offsetY);
    } else {
      ctx.closePath();
      saveToHistory();
    }
    
    setIsDrawing(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // For touch events
    if (e.touches && e.touches[0]) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    
    // For mouse events
    return {
      offsetX: e.nativeEvent.offsetX || e.nativeEvent.layerX,
      offsetY: e.nativeEvent.offsetY || e.nativeEvent.layerY
    };
  };

  const addText = () => {
    if (!textInput.trim()) {
      setTextMode(false);
      return;
    }
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = lineColor;
    ctx.globalAlpha = opacity / 100;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput("");
    setTextMode(false);
    saveToHistory();
  };

  const handleCanvasClick = (e) => {
    if (textMode) {
      const { offsetX, offsetY } = getCoordinates(e);
      setTextPosition({ x: offsetX, y: offsetY });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctx.fillStyle = backgroundColor;
    ctx.globalAlpha = 1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");
    if (onSave) {
      onSave(imageData);
      message.success("Drawing saved successfully!");
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");
    
    // Create download link
    const link = document.createElement("a");
    link.download = "prescription-" + new Date().toISOString().slice(0, 10) + ".png";
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Draw the image at center of canvas or resize as needed
        const canvas = canvasRef.current;
        const maxWidth = canvas.width;
        const maxHeight = canvas.height;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Center the image
        const x = (maxWidth - width) / 2;
        const y = (maxHeight - height) / 2;
        
        ctx.drawImage(img, x, y, width, height);
        saveToHistory();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="enhanced-drawing-canvas-container">
      <div className="canvas-toolbar">
        <div className="tool-section">
          <Radio.Group value={tool} onChange={(e) => {
            setTool(e.target.value);
            setTextMode(e.target.value === "text");
          }}>
            <Tooltip title="Pen"><Radio.Button value="pen"><FormOutlined /></Radio.Button></Tooltip>
            <Tooltip title="Eraser"><Radio.Button value="eraser"><ClearOutlined /></Radio.Button></Tooltip>
            <Tooltip title="Line"><Radio.Button value="line"><LineOutlined /></Radio.Button></Tooltip>
            <Tooltip title="Rectangle"><Radio.Button value="rectangle"><BorderOuterOutlined /></Radio.Button></Tooltip>
            <Tooltip title="Circle"><Radio.Button value="circle">◯</Radio.Button></Tooltip>
            <Tooltip title="Text"><Radio.Button value="text"><FontSizeOutlined /></Radio.Button></Tooltip>
          </Radio.Group>
        </div>
        
        <div className="color-options">
          <span>Color:</span>
          <input
            type="color"
            value={lineColor}
            onChange={(e) => setLineColor(e.target.value)}
          />
          
          <span>Width:</span>
          <Slider 
            min={1} 
            max={30} 
            value={lineWidth}
            onChange={setLineWidth}
            style={{ width: 100, margin: "0 10px" }}
          />
          
          <span>Opacity:</span>
          <Slider 
            min={10} 
            max={100} 
            value={opacity}
            onChange={setOpacity}
            style={{ width: 100, margin: "0 10px" }}
          />
        </div>
        
        <div className="canvas-actions">
          <Tooltip title="Undo">
            <Button onClick={undo} icon={<UndoOutlined />} disabled={historyIndexRef.current <= 0} />
          </Tooltip>
          <Tooltip title="Redo">
            <Button onClick={redo} icon={<RedoOutlined />} disabled={historyIndexRef.current >= historyRef.current.length - 1} />
          </Tooltip>
          <Tooltip title="Clear All">
            <Button onClick={clearCanvas} icon={<ClearOutlined />} danger />
          </Tooltip>
          <Tooltip title="Save">
            <Button type="primary" onClick={saveCanvas} icon={<SaveOutlined />} />
          </Tooltip>
          <Tooltip title="Download">
            <Button onClick={downloadCanvas} icon={<DownloadOutlined />} />
          </Tooltip>
          
          <Tooltip title="Insert Image">
            <label className="upload-button">
              <PictureOutlined />
              <input 
                type="file" 
                accept="image/*" 
                onChange={uploadImage} 
                style={{ display: "none" }}
              />
            </label>
          </Tooltip>
        </div>
      </div>
      
      {textMode && (
        <div className="text-controls">
          <Input 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text..."
            style={{ width: 200 }}
          />
          <select 
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
          <Input
            type="number"
            min={8}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            style={{ width: 60, marginLeft: 10 }}
          />
          <Button onClick={addText} type="primary" style={{ marginLeft: 10 }}>
            Add Text
          </Button>
          <Button onClick={() => setTextMode(false)} style={{ marginLeft: 10 }}>
            Cancel
          </Button>
        </div>
      )}
      
      <div className="canvas-container" style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            touchAction: "none", // Prevents scrolling on touch devices
            position: "absolute",
            zIndex: 1
          }}
        />
        
        {/* Preview canvas for shapes */}
        <canvas
          ref={previewCanvasRef}
          width={800}
          height={500}
          style={{ 
            border: "1px solid #ddd", 
            borderRadius: "4px",
            touchAction: "none",
            position: "absolute",
            zIndex: 2,
            pointerEvents: "none" // Allow clicks to pass through to the main canvas
          }}
        />
      </div>
      
      <style jsx>{`
        .enhanced-drawing-canvas-container {
          margin: 20px 0;
        }
        .canvas-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
        }
        .tool-section, .color-options, .canvas-actions {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .canvas-container {
          width: 800px;
          height: 500px;
          margin: 0 auto;
        }
        .text-controls {
          margin: 10px 0;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          display: flex;
          align-items: center;
        }
        .upload-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d9d9d9;
          border-radius: 2px;
          padding: 4px 15px;
          height: 32px;
          background: #fff;
          cursor: pointer;
        }
        .upload-button:hover {
          color: #1890ff;
          border-color: #1890ff;
        }
      `}</style>
    </div>
  );
};

export default EnhancedDrawingCanvas;