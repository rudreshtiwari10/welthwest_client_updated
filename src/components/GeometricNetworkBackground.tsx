import React, { useEffect, useRef } from 'react';

interface GeometricNetworkBackgroundProps {
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

const GeometricNetworkBackground: React.FC<GeometricNetworkBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNodes = () => {
      const nodes: Node[] = [];
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000); // Responsive node count

      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          connections: []
        });
      }

      // Create connections between nearby nodes
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const distance = Math.sqrt(
              Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
            );
            if (distance < 150 && node.connections.length < 3) {
              node.connections.push(j);
            }
          }
        });
      });

      nodesRef.current = nodes;
    };

    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;

      // Draw connections first (behind nodes)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)'; // Indigo color with low opacity
      ctx.lineWidth = 1;

      nodes.forEach((node, i) => {
        node.connections.forEach(connectionIndex => {
          const connectedNode = nodes[connectionIndex];
          if (connectedNode) {
            const distance = Math.sqrt(
              Math.pow(node.x - connectedNode.x, 2) + Math.pow(node.y - connectedNode.y, 2)
            );

            // Fade connection based on distance
            const opacity = Math.max(0, (150 - distance) / 150) * 0.2;
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;

            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        // Calculate distance to mouse for interaction effect
        const mouseDistance = Math.sqrt(
          Math.pow(node.x - mouseRef.current.x, 2) + Math.pow(node.y - mouseRef.current.y, 2)
        );

        const isNearMouse = mouseDistance < 100;
        const nodeSize = isNearMouse ? 3 : 2;
        const nodeOpacity = isNearMouse ? 0.8 : 0.4;

        // Node core
        ctx.fillStyle = `rgba(99, 102, 241, ${nodeOpacity})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Node glow effect
        if (isNearMouse) {
          ctx.fillStyle = `rgba(99, 102, 241, 0.1)`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    const updateNodes = () => {
      const nodes = nodesRef.current;

      nodes.forEach((node) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) {
          node.vx *= -1;
          node.x = Math.max(0, Math.min(canvas.width, node.x));
        }
        if (node.y <= 0 || node.y >= canvas.height) {
          node.vy *= -1;
          node.y = Math.max(0, Math.min(canvas.height, node.y));
        }

        // Mouse interaction - nodes move away from cursor
        const mouseDistance = Math.sqrt(
          Math.pow(node.x - mouseRef.current.x, 2) + Math.pow(node.y - mouseRef.current.y, 2)
        );

        if (mouseDistance < 80) {
          const angle = Math.atan2(node.y - mouseRef.current.y, node.x - mouseRef.current.x);
          const force = (80 - mouseDistance) / 80 * 0.02;
          node.vx += Math.cos(angle) * force;
          node.vy += Math.sin(angle) * force;
        }

        // Apply friction
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Limit velocity
        const maxSpeed = 1;
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > maxSpeed) {
          node.vx = (node.vx / speed) * maxSpeed;
          node.vy = (node.vy / speed) * maxSpeed;
        }
      });
    };

    const animate = () => {
      updateNodes();
      drawNetwork();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = event.clientX - rect.left;
      mouseRef.current.y = event.clientY - rect.top;
    };

    const handleResize = () => {
      resizeCanvas();
      createNodes();
    };

    // Initialize
    resizeCanvas();
    createNodes();
    animate();

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};

export default GeometricNetworkBackground;