clear all; %clear data
close all; %close figures

load outputController.dat; %load data
%make copy of file in local directory and then rename to outputController
%do not rename to outputController.dat or Matlab won't find it.
%load C:\Users\Owner\Documents\Research\Heart\Hypertension\IdentityModel\DelayedFeedbackFloatNet5V2\Stratified\ClosedLoop\Die\outputController.dat;
%load C:\Users\Owner\Documents\Research\Heart\Hypertension\IdentityModel\DelayedFeedbackFloatNet5V2\TopDown\ClosedLoop\Die\outputController.dat;
NumberOfLayers=3; %number of layers
NumberOfCells=[600 600 600]; %cells per layer
TotalNumberOfCells = sum(NumberOfCells);
[mrows,ncols]=size(outputController);

%define variables
x=outputController(:,1); %time
y1=outputController(:,2); %rate
y2=outputController(:,3); %demand
y3=outputController(:,4); %move/(max - min)% sympathetic efferent
y4=-1*outputController(:,5); %threshold % indirect parasympathetic efferent
y5=-1*outputController(:,6); %direct parasympathetic efferent
y6=outputController(:,7); %recruitment = coefficient of variation
y7=outputController(:,8); %first cell
FirstCellPosition=8; %initialize where cell information begins

%plot variables
figure(1);
hold on;
plot(x,y1,'m','LineWidth',2); %rate
plot(x,y2,'k','LineWidth',1); %demand
plot(x,y3/0.0008,'r','LineWidth',2); %demand % sympathetic efferent
%plot(x,y4/0.0008,'g','LineWidth',2); %unscaled netmove % indirect sympathetic efferent
plot(x,y5/0.0008,'b','LineWidth',2); %net move % direct parasympathetic efferent
xlabel('\tau (sec)');
%plot(x,[0;diff(y5)],'g'); %move
%plot(x,y4,'k','LineWidth',1); %threshold
%plot(x,1./y6,'g'); %recruitment = 1/coefficient of variation = mu_n/sigma_n
%plot(x,outputController(:,ncols)/100,'b','Linewidth',2); %number of alive cells
ylim([-0.4 0.8]);
title('Heart Rate(r)');
dpos=0.55;
text(2500,0,'I_1','FontSize',14,'Color','r');
line([2500 2500],[-0.8 0.8],'LineWidth',1.5,'Color','r');
text(6000,0,'I_2','FontSize',14,'Color','r');
line([6000 6000],[-0.8 0.8],'LineWidth',1.5,'Color','r');
text(9500,0,'I_3','FontSize',14,'Color','r');
line([9500 9500],[-0.8 0.8],'LineWidth',1.5,'Color','r');
text(4500,dpos,'D_1','FontSize',14);
line([4500 4500],[-0.8 0.8],'LineWidth',1.5,'Color','k');
text(8000,dpos,'D_2','FontSize',14);
line([8000 8000],[-0.8 0.8],'LineWidth',1.5,'Color','k');
text(11500,dpos,'D_3','FontSize',14);
line([11500 11500],[-0.8 0.8],'LineWidth',1.5,'Color','k');
text(3500,0.1,'R_1','FontSize',14,'Color','b');
line([3500 3500],[-0.8 0.8],'LineWidth',1.5);
text(7000,0.1,'R_2','FontSize',14,'Color','b');
line([7000 7000],[-0.8 0.8],'LineWidth',1.5);
text(10500,0.1,'R_3','FontSize',14,'Color','b');
line([10500 10500],[-0.8 0.8],'LineWidth',1.5);
%text(14000,0.1,'R_4','FontSize',14,'Color','b');
%line([14000 14000],[-0.8 0.8],'LineWidth',1.5);
title({'HeartRate (magenta),Demand (black)';'Sym Eff (red),Direct PS Eff (blue)'});
grid on;

%plot cell firing data
figure(21);
hold on;
FirstParasympathetic=500;
for i=FirstCellPosition+0*TotalNumberOfCells+FirstParasympathetic:FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1)-1
plot(x,outputController(:,i),'b');
end
title('Parasympathetic Cell Activity: Cardiac Level');
%plot cell firing data
figure(2);
hold on;
%for i=FirstCellPosition+0*TotalNumberOfCells:FirstCellPosition+1*TotalNumberOfCells-1
%plot(x,outputController(:,i),'b');
%end
for i=FirstCellPosition+0*TotalNumberOfCells:FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1)-1
plot(x,outputController(:,i),'r');
end
for i=FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1):FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)-1
plot(x,outputController(:,i),'g');
end
for i=FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2):FirstCellPosition+0*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)+NumberOfCells(3)-1
plot(x,outputController(:,i),'b');
end
title('Cell Activity: Cardiac(r), Intrathoracic(g), Central(b)');
ylim([0 1.1]);

%plot heart throughput data
figure(3);
hold on;
for i=FirstCellPosition+1*TotalNumberOfCells:FirstCellPosition+1*TotalNumberOfCells+NumberOfCells(1)-1
plot(x,outputController(:,i),'r');
end
for i=FirstCellPosition+1*TotalNumberOfCells+NumberOfCells(1):FirstCellPosition+1*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)-1
plot(x,outputController(:,i),'g');
end
for i=FirstCellPosition+1*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2):FirstCellPosition+1*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)+NumberOfCells(3)-1
plot(x,outputController(:,i),'b');
end
title('Heart Throughput: Cardiac(r), Intrathoracic(g), Central(b)');

%plot blood throughput data
figure(4);
hold on;
for i=FirstCellPosition+2*TotalNumberOfCells:FirstCellPosition+2*TotalNumberOfCells+NumberOfCells(1)-1
plot(x,outputController(:,i),'r');
end
for i=FirstCellPosition+2*TotalNumberOfCells+NumberOfCells(1):FirstCellPosition+2*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)-1
plot(x,outputController(:,i),'g');
end
for i=FirstCellPosition+2*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2):FirstCellPosition+2*TotalNumberOfCells+NumberOfCells(1)+NumberOfCells(2)+NumberOfCells(3)-1
plot(x,outputController(:,i),'b');
end
title('Blood Throughput: Cardiac(r), Intrathoracic(g), Central(b)');

%carpet plot full network data set
figure(5);
%ylim([-0.1 1.1]);
%image(1:90,x,fix(50*outputController(:,FirstCellPosition:FirstCellPosition+1*TotalNumberOfCells-1)));
%image(x,1:600,fix(50*(outputController(:,FirstCellPosition:FirstCellPosition+NumberOfCells(1)-1))'));
image(x,1:1800,fix(50*(outputController(:,FirstCellPosition:FirstCellPosition+TotalNumberOfCells-1))'));
colormap(gray);
title({'Cell Activity Level, Heart and Blood Throughput ';[int2str(NumberOfLayers),' Layers and ',int2str(NumberOfCells),' Cells per Layer']});

%plot layer average neighbour importance (repeated on next figure)
figure(6);
hold on;
j=0;
    for i=ncols-1-2*NumberOfLayers-NumberOfLayers:ncols-1-2*NumberOfLayers-1
        j=j+1;
        xcolor=j/NumberOfLayers;
        plot(x,outputController(:,i)./outputController(:,ncols),'Color',[1-xcolor,abs(0.5-xcolor),abs(0.25-xcolor)],'Linewidth',2+2*j/NumberOfLayers); %bottom layer
    end
    legend('Cardiac','Intrathoracic','Central');
xlabel('\tau (sec)');
title('Relative Weight in Hierarchy');
ylim([0.0 0.4]);
ipos=0.32;
rpos=ipos;
text(2500,ipos,'I_1','FontSize',14,'Color','r');
line([2500 2500],[0 0.8],'LineWidth',1.5,'Color','r');
text(6000,ipos,'I_2','FontSize',14,'Color','r');
line([6000 6000],[0 0.8],'LineWidth',1.5,'Color','r');
text(9500,ipos,'I_3','FontSize',14,'Color','r');
line([9500 9500],[0 0.8],'LineWidth',1.5,'Color','r');
text(4500,0.35,'D_1','FontSize',14);
line([4500 4500],[0 0.8],'LineWidth',1.5,'Color','k');
text(8000,0.35,'D_2','FontSize',14);
line([8000 8000],[0 0.8],'LineWidth',1.5,'Color','k');
text(11500,0.35,'D_3','FontSize',14);
line([11500 11500],[0 0.8],'LineWidth',1.5,'Color','k');
text(3500,rpos,'R_1','FontSize',14,'Color','b');
line([3500 3500],[0 0.8],'LineWidth',1.5,'Color','b');
text(7000,rpos,'R_2','FontSize',14,'Color','b');
line([7000 7000],[0 0.8],'LineWidth',1.5,'Color','b');
text(10500,rpos,'R_3','FontSize',14,'Color','b');
line([10500 10500],[0 0.8],'LineWidth',1.5,'Color','b');
%text(14000,rpos,'R_4','FontSize',14,'Color','b');
%line([14000 14000],[0 0.8],'LineWidth',1.5,'Color','b');
grid on;

%plot layer neighbour importance standard deviation (shifted by +1 from
%previous graph which plots the layer neighbour importance average
figure(7);
hold on;
j=0;
    for i=ncols-1-2*NumberOfLayers+1:2:ncols-1-1
        j=j+1;
        xcolor=j/2/NumberOfLayers;
        %bottom layer has thinnest and lightest line. Line thickness goes
        %up and Line color deepens as the layers increase toward the top layer.
        plot(x,outputController(:,i),'Color',[1-xcolor,1-xcolor,1-xcolor],'Linewidth',1+2*j/NumberOfLayers);
    end
%net standard deviation
%plot(x,outputController(:,ncols-1),'r','Linewidth',2);
legend('Cardiac','Intrathoracic','Central');
title('Layer: Neighbour Importance Standard Deviation');
