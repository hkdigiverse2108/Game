$(document).ready(function(){

    var isAI = false;

    // Loader fade out logic
    setTimeout(function() {
        $('#loader-wrapper').css('opacity', '0');
        setTimeout(function() {
            $('#loader-wrapper').css('display', 'none');
            $('#settings-modal').css('display', 'flex');
        }, 800);
    }, 1500);

    $('#btn-pvp').click(function() {
        isAI = false;
        $('#settings-modal').fadeOut();
        strikerPlace();
    });

    $('#btn-pva').click(function() {
        isAI = true;
        $('#settings-modal').fadeOut();
        strikerPlace();
    });

    function getMouseScaled(event, canvas) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    function strikerPlace(){
        var c = document.getElementById("Striker");
        var ctx = c.getContext("2d");
        coins[0].x = players[currPlayer].x;
        coins[0].y = players[currPlayer].y;
        coins[0].color = '#D3A625'; // Dark Yellow Striker
        ctx.clearRect(0,0,720,720);
        drawCoins();
        drawCircle(coins[0].x,coins[0].y,12.5, coins[0].color, ctx);

        if (currPlayer === 1 && isAI) {
            playAI(c, ctx);
            return;
        }

        $("#Striker").on("mousemove",function(event){
            var mouse = getMouseScaled(event, c);
            xCo = mouse.x;
            yCo = mouse.y;
            if(xCo <   players[currPlayer].rb && xCo >  players[currPlayer].lb)
                coins[0].x = xCo; 
            $("#mp").html("X : " + Math.round(xCo) +"  Y : " + Math.round(yCo));
            ctx.clearRect(0,0,720,720);
            drawCoins();
            drawCircle(coins[0].x,coins[0].y,12.5, coins[0].color, ctx);       
        }).click(function(){
            $("#Striker").off("mousemove");
            polePlace();
            return;
        });
    }

    function playAI(c, ctx) {
        setTimeout(function() {
            var targetCoin;
            if (coins.length > 1) {
                var cIdx = Math.floor(Math.random() * (coins.length - 1)) + 1;
                targetCoin = coins[cIdx];
            } else {
                targetCoin = {x: 360, y: 360};
            }
            
            var targetX = Math.max(players[currPlayer].lb, Math.min(players[currPlayer].rb, targetCoin.x));
            var startX = coins[0].x;
            var startTime = performance.now();
            var duration = 1500; // Slide takes 1.5 seconds
            
            function animateMove(time) {
                var elapsed = time - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var ease = progress * (2 - progress); // Ease out quad
                coins[0].x = startX + (targetX - startX) * ease;
                
                ctx.clearRect(0,0,720,720);
                drawCoins();
                drawCircle(coins[0].x, coins[0].y, 12.5, coins[0].color, ctx);
                
                if (progress < 1) {
                    requestAnimationFrame(animateMove);
                } else {
                    aimLine(); // Move to aiming phase
                }
            }
            requestAnimationFrame(animateMove);

            function aimLine() {
                setTimeout(function() {
                    var targetXVar = targetCoin.x + (Math.random() * 10 - 5);
                    var targetYVar = targetCoin.y + (Math.random() * 10 - 5);

                    // Carrom uses Slingshot aiming (pull back to shoot forward).
                    // The AI needs to draw the `pole` in the EXACT opposite direction!
                    poleX = coins[0].x - (targetXVar - coins[0].x);
                    poleY = coins[0].y - (targetYVar - coins[0].y);

                    slope = (poleX-coins[0].x)/(poleY-coins[0].y);
                    
                    ctx.clearRect(0,0,720,720);
                    drawCoins();
                    drawCircle(coins[0].x, coins[0].y, 12.5, coins[0].color, ctx);
                    drawLine(coins[0].x, coins[0].y, poleX, poleY, 'rgba(255, 255, 255, 0.6)', ctx);
                    
                    document.getElementById("Ranger").value = Math.floor(70 + Math.random() * 25);
                    
                    setTimeout(function() {
                        hitStriker();
                    }, 500);
                }, 500);
            }
        }, 1000); // Intro think time
    }

    //calculating angle of impact of pole with striker
    function polePlace(){
        $("#Striker").on("mousemove",function(event){
            var c = document.getElementById("Striker");
            var ctx = c.getContext("2d");
            var mouse = getMouseScaled(event, c);
            var x = mouse.x;
            var y = mouse.y;
            
            ctx.clearRect(0,0,720,720);
            drawCoins();
            drawCircle(coins[0].x,coins[0].y,12.5, coins[0].color, ctx);
            drawLine(coins[0].x,coins[0].y,x,y,'black',ctx);
            poleX = x;
            poleY = y;
        }).click(function(event){
            slope = (poleX-coins[0].x)/(poleY-coins[0].y);
            $("#Striker").off("click");
            $("#Striker").off("mousemove");
            hitStriker();
            return;
        });
    }
    //hitting Striker
    function hitStriker(){
            var canvas = document.getElementById("Striker");
            var c = canvas.getContext('2d');
            var ranger = document.getElementById("Ranger").value;
            var vX = ranger*Math.sin(Math.atan(slope));
            var vY = ranger*Math.cos(Math.atan(slope));
            if(poleY > coins[0].y)
            {
                vX = -vX;
                vY = -vY;
            }
            coins[0].vx = vX;
            coins[0].vy = vY;
            function draw(){
                c.clearRect(0,0,720,720);
                for(var i=0;i<coins.length;i++)
                {
                    for(var j=0;j<coins.length;j++)
                    {
                        if(j!=i)
                            coins[j].crash(i,j);
                    }
                }
                for(var i=0;i<coins.length;i++)
                {
                    drawCircle(coins[i].x,coins[i].y,12.5,coins[i].color,c);
                    coins[i].rebound();
                    coins[i].update();
                    if(Math.abs(coins[i].vx)<=0.3 && Math.abs(coins[i].vy)<=0.3)
                    {
                        coins[i].vx=0;
                        coins[i].vy=0;
                        if(allCoinStop())
                        {
                            currPlayer = (currPlayer+1)%TotalplayerNo;
                            drawCoins();
                            window.cancelAnimationFrame(myreq);
                            strikerPlace();
                            return;
                        }
                    }
                    if(coinPot(coins[i]))
                    {
                        if(i==0)
                        {
                            players[currPlayer].score--;
                            updateScore();
                            currPlayer = (currPlayer+1)%TotalplayerNo;
                            drawCoins();
                            window.cancelAnimationFrame(myreq);
                            strikerPlace();
                            return;
                        }
                        else
                        {
                            if (coins[i].isQueen) {
                                players[currPlayer].score += 2;
                            } else {
                                players[currPlayer].score++;
                            }
                            updateScore();
                            currPlayer = (currPlayer+1)%TotalplayerNo;
                            coins.splice(i,1);
                        }
                        
                    }
                    if(coins.length==1)
                    {
                        alert('Game Over! Player ' + (currPlayer+1) + ' won.');
                        return;
                    }
                }
            myreq = requestAnimationFrame(draw);
        }
        myreq = requestAnimationFrame(draw);
    }

});